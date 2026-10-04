import asyncio
import time
import uuid
from typing import Dict, List, Optional
from app.schemas.contract import BryntumProjectData, EscrowStatusSummary
from app.schemas.milestone import Milestone, BryntumDependency, MilestoneVerifyRequest, MilestonePayoutResult
from app.schemas.telemetry import AuditEvent
from app.core.paypal_client import paypal_client
from app.services.verification_agent import verification_agent
from app.core.config import settings

class EscrowManager:
    """
    Central state engine for contract escrow, Bryntum Gantt timelines,
    and PayPal headless release orchestration.
    """

    def __init__(self):
        self.current_project: Optional[BryntumProjectData] = None
        self.audit_log: List[AuditEvent] = []
        self._sse_subscribers: List[asyncio.Queue] = []

    def set_project(self, project: BryntumProjectData):
        self.current_project = project
        self.record_audit_event(
            event_type="ESCROW_LOCKED",
            title=f"PayPal Escrow Authorized: {project.title}",
            description=f"${project.total_budget:,.2f} {project.currency} authorized across {len(project.tasks)} milestones. PayPal Order: {project.paypal_auth_order_id}",
            paypal_order_id=project.paypal_auth_order_id,
            amount=project.total_budget,
            currency=project.currency,
            severity="SUCCESS",
            metadata={"milestones_count": len(project.tasks)}
        )

    def record_audit_event(
        self,
        event_type: str,
        title: str,
        description: str,
        milestone_id: Optional[int] = None,
        paypal_order_id: Optional[str] = None,
        paypal_capture_id: Optional[str] = None,
        amount: Optional[float] = None,
        currency: str = "USD",
        verification_hash: Optional[str] = None,
        severity: str = "INFO",
        metadata: Optional[Dict] = None
    ) -> AuditEvent:
        event = AuditEvent(
            id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            event_type=event_type,
            milestone_id=milestone_id,
            title=title,
            description=description,
            paypal_order_id=paypal_order_id,
            paypal_capture_id=paypal_capture_id,
            amount=amount,
            currency=currency,
            verification_hash=verification_hash,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            severity=severity,
            metadata=metadata or {}
        )
        self.audit_log.insert(0, event)
        # Notify SSE listeners
        for queue in list(self._sse_subscribers):
            try:
                queue.put_nowait(event)
            except Exception:
                pass
        return event

    def subscribe_events(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._sse_subscribers.append(q)
        return q

    def unsubscribe_events(self, q: asyncio.Queue):
        if q in self._sse_subscribers:
            self._sse_subscribers.remove(q)

    def get_summary(self) -> EscrowStatusSummary:
        if not self.current_project:
            return EscrowStatusSummary(
                project_id="NONE",
                title="No Active Project",
                total_budget=0.0,
                total_in_escrow=0.0,
                total_released=0.0,
                milestones_count=0,
                completed_milestones=0,
                pending_milestones=0,
                paypal_auth_order_id=None,
                paypal_status="IDLE",
                is_live_sandbox=settings.is_paypal_sandbox_configured
            )
        
        tasks = self.current_project.tasks
        completed = sum(1 for m in tasks if m.status == "COMPLETED" or m.escrow_status == "RELEASED")
        pending = len(tasks) - completed
        
        take_rate_pct = settings.PLATFORM_TAKE_RATE_PCT * 100
        platform_rev = round(self.current_project.total_released * settings.PLATFORM_TAKE_RATE_PCT, 2)
        net_freelancer = round(self.current_project.total_released - platform_rev, 2)

        return EscrowStatusSummary(
            project_id=self.current_project.project_id,
            title=self.current_project.title,
            total_budget=self.current_project.total_budget,
            total_in_escrow=self.current_project.total_in_escrow,
            total_released=self.current_project.total_released,
            milestones_count=len(tasks),
            completed_milestones=completed,
            pending_milestones=pending,
            paypal_auth_order_id=self.current_project.paypal_auth_order_id,
            paypal_status="AUTHORIZED" if self.current_project.total_in_escrow > 0 else "SETTLED",
            is_live_sandbox=settings.is_paypal_sandbox_configured,
            platform_take_rate_pct=take_rate_pct,
            total_platform_revenue=platform_rev,
            net_freelancer_disbursed=net_freelancer,
        )

    async def verify_and_release_milestone(
        self,
        milestone_id: int,
        verify_req: MilestoneVerifyRequest
    ) -> MilestonePayoutResult:
        if not self.current_project:
            raise ValueError("No active project loaded.")

        # Find target milestone
        target: Optional[Milestone] = None
        for m in self.current_project.tasks:
            if m.id == milestone_id:
                target = m
                break

        if not target:
            raise ValueError(f"Milestone #{milestone_id} not found.")

        if target.escrow_status == "RELEASED":
            raise ValueError(f"Milestone #{milestone_id} funds have already been released.")

        # 1. Verification Step
        v_res = await verification_agent.verify_deliverable(target, verify_req)
        v_hash = v_res["verification_hash"]
        target.verification_hash = v_hash
        target.status = "VERIFYING"

        self.record_audit_event(
            event_type="PR_VERIFICATION",
            milestone_id=milestone_id,
            title=f"AI Cryptographic Deliverable Verified: {target.name}",
            description=f"GitHub PR verified. Coverage: {v_res['coverage_pct']}%, Score: {v_res['audit_score']}%. Proof Hash: {v_hash[:22]}...",
            verification_hash=v_hash,
            severity="INFO",
            metadata=v_res
        )

        # 2. PayPal Release Step
        order_id = target.paypal_order_id or self.current_project.paypal_auth_order_id or f"PP-AUTH-MOCK-{uuid.uuid4().hex[:8].upper()}"
        capture_res = await paypal_client.release_milestone_funds(
            order_id=order_id,
            milestone_amount=target.amount,
            milestone_id=target.id,
            currency=target.currency,
            verification_hash=v_hash
        )

        cap_id = capture_res.get("capture_id", f"PP-CAP-{uuid.uuid4().hex[:10].upper()}")
        target.status = "COMPLETED"
        target.progress = 100
        target.escrow_status = "RELEASED"
        target.paypal_order_id = order_id
        target.paypal_capture_id = cap_id

        # Update Project Balances
        self.current_project.total_released += target.amount
        self.current_project.total_in_escrow = max(0.0, self.current_project.total_budget - self.current_project.total_released)

        # Record Audit Event
        self.record_audit_event(
            event_type="PAYPAL_CAPTURE",
            milestone_id=milestone_id,
            title=f"PayPal Milestone Payout Released: ${target.amount:,.2f} {target.currency}",
            description=f"Automated capture executed. Capture ID: {cap_id} on Order: {order_id}. Funds routed to freelancer wallet.",
            paypal_order_id=order_id,
            paypal_capture_id=cap_id,
            amount=target.amount,
            currency=target.currency,
            verification_hash=v_hash,
            severity="SUCCESS",
            metadata=capture_res
        )

        # Persist to database if SessionLocal available
        try:
            from app.core.database import SessionLocal
            from app.models.entities import PlatformRevenue, AuditLog as DBAuditLog
            db = SessionLocal()
            try:
                take_rate_amt = round(target.amount * settings.PLATFORM_TAKE_RATE_PCT, 2)
                net_amt = round(target.amount - take_rate_amt, 2)
                rev = PlatformRevenue(
                    id=f"REV-{uuid.uuid4().hex[:8].upper()}",
                    contract_id=self.current_project.project_id,
                    milestone_id=target.id,
                    milestone_amount=target.amount,
                    take_rate_pct=settings.PLATFORM_TAKE_RATE_PCT,
                    take_rate_amount=take_rate_amt,
                    net_freelancer_amount=net_amt,
                    currency=target.currency,
                    paypal_capture_id=cap_id
                )
                db.add(rev)

                db_audit = DBAuditLog(
                    id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
                    event_type="PAYPAL_CAPTURE",
                    contract_id=self.current_project.project_id,
                    milestone_id=target.id,
                    title=f"Milestone #{target.id} Payout Released: ${target.amount:,.2f}",
                    description=f"Automated capture {cap_id}. Take-Rate: ${take_rate_amt:,.2f}, Net: ${net_amt:,.2f}.",
                    payload=str(capture_res),
                    hash=v_hash,
                    severity="SUCCESS",
                    amount=target.amount,
                    currency=target.currency,
                    paypal_order_id=order_id,
                    paypal_capture_id=cap_id,
                )
                db.add(db_audit)
                db.commit()
            finally:
                db.close()
        except Exception as db_err:
            print(f"[EscrowManager] DB persistence note: {db_err}")

        return MilestonePayoutResult(
            milestone_id=target.id,
            milestone_name=target.name,
            amount=target.amount,
            currency=target.currency,
            paypal_order_id=order_id,
            paypal_capture_id=cap_id,
            escrow_status="RELEASED",
            status="COMPLETED",
            verification_hash=v_hash,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            debug_mode=capture_res.get("is_mock", True),
            details=capture_res
        )

escrow_manager = EscrowManager()
