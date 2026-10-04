import asyncio
import json
import time
import uuid
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.schemas.contract import ContractDecomposeRequest, BryntumProjectData, EscrowStatusSummary
from app.schemas.milestone import MilestoneVerifyRequest, MilestonePayoutResult
from app.services.gemini_decomposer import gemini_decomposer
from app.services.escrow_manager import escrow_manager
from app.core.paypal_client import paypal_client

router = APIRouter()

@router.post("/contracts/decompose", response_model=BryntumProjectData)
async def decompose_contract(req: ContractDecomposeRequest):
    """
    Ingests contract text, invokes Gemini 2.5 Flash decomposition,
    and locks total contract value into a PayPal Sandbox AUTHORIZATION order.
    """
    try:
        title, budget, milestones, dependencies = await gemini_decomposer.decompose_contract(
            raw_contract_text=req.raw_contract_text,
            project_title=req.project_title,
            total_budget=req.total_budget,
            currency=req.currency
        )

        # Create PayPal Escrow Order (intent=AUTHORIZE)
        escrow_order = await paypal_client.create_milestone_escrow(
            total_amount=budget,
            currency=req.currency,
            project_title=title,
            milestones_count=len(milestones)
        )
        auth_order_id = escrow_order.get("order_id", f"PP-AUTH-MOCK-{uuid.uuid4().hex[:8].upper()}")

        # Assign order id to milestones
        for m in milestones:
            m.paypal_order_id = auth_order_id

        # Calculate initial released and escrow
        already_released = sum(m.amount for m in milestones if m.escrow_status == "RELEASED")
        locked_escrow = max(0.0, budget - already_released)

        project = BryntumProjectData(
            project_id=f"PRJ-{uuid.uuid4().hex[:6].upper()}",
            title=title,
            currency=req.currency,
            total_budget=budget,
            total_released=already_released,
            total_in_escrow=locked_escrow,
            paypal_auth_order_id=auth_order_id,
            tasks=milestones,
            dependencies=dependencies,
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            sla_hours=48,
            dispute_grace_period_days=7
        )

        escrow_manager.set_project(project)
        return project

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Contract decomposition failed: {str(e)}")

@router.get("/project", response_model=BryntumProjectData)
async def get_project():
    """
    Fetch the current active Bryntum Gantt project state.
    """
    if not escrow_manager.current_project:
        # Load default demo scenario if none loaded yet
        await load_preset("defi")
    return escrow_manager.current_project

@router.post("/milestones/{milestone_id}/verify", response_model=MilestonePayoutResult)
async def verify_and_release_milestone(milestone_id: int, req: MilestoneVerifyRequest):
    """
    Simulates automated GitHub CI/PR deliverable audit and triggers headless PayPal capture.
    """
    try:
        result = await escrow_manager.verify_and_release_milestone(milestone_id, req)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payout capture release failed: {str(e)}")

@router.get("/escrow-summary", response_model=EscrowStatusSummary)
async def get_escrow_summary():
    """
    Returns live balance breakdown locked in PayPal Escrow vs Released.
    """
    return escrow_manager.get_summary()

@router.get("/audit-events")
async def get_audit_events():
    """
    Returns recent audit ledger events.
    """
    return escrow_manager.audit_log

@router.get("/audit-stream")
async def audit_stream(request: Request):
    """
    Server-Sent Events (SSE) streaming real-time verification and transaction events to UI.
    """
    async def event_generator():
        queue = escrow_manager.subscribe_events()
        try:
            # Send initial connection event
            initial = {
                "event": "CONNECTED",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "message": "Connected to MilestonePay AI Real-Time Telemetry Stream"
            }
            yield f"data: {json.dumps(initial)}\n\n"

            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {event.model_dump_json()}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat
                    yield f": heartbeat\n\n"
        finally:
            escrow_manager.unsubscribe_events(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/preset-load/{scenario_key}")
async def load_preset(scenario_key: str):
    """
    One-click instant scenario loader for hackathon evaluators.
    Key options: 'defi', 'rag', 'mobile', 'custom'
    """
    scenarios = {
        "defi": {
            "title": "Web3 DeFi Exchange Build ($2,800 total - 4 Milestones)",
            "text": "Scope of Work: Design and develop a decentralized exchange protocol with Uniswap V3 liquidity vaults, The Graph indexer, and Next.js trading terminal. Total compensation $2,800 USD authorized into PayPal escrow upon signing.",
            "budget": 2800.0
        },
        "rag": {
            "title": "Enterprise LLM RAG Pipeline ($1,500 total - 3 Milestones)",
            "text": "Statement of Work: Build an enterprise-grade Retrieval-Augmented Generation pipeline using Qdrant vector database, LangGraph self-correction guardrails, and streaming FastAPI endpoints. Budget $1,500 USD.",
            "budget": 1500.0
        },
        "mobile": {
            "title": "Mobile Fintech App & PayPal Checkout ($4,000 total - 5 Milestones)",
            "text": "Contract: Architect and deploy a high-security React Native mobile banking app with biometric authentication, PayPal Native SDK Checkout, P2P split pay, and KYC verification. Budget $4,000 USD.",
            "budget": 4000.0
        }
    }

    choice = scenarios.get(scenario_key.lower(), scenarios["defi"])
    req = ContractDecomposeRequest(
        raw_contract_text=choice["text"],
        project_title=choice["title"],
        total_budget=choice["budget"],
        currency="USD"
    )
    return await decompose_contract(req)
