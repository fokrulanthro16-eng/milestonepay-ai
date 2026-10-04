from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class BryntumDependency(BaseModel):
    id: str
    from_task: int = Field(..., alias="from")
    to_task: int = Field(..., alias="to")
    type: int = 2  # 2 = End-to-Start in Bryntum Gantt
    lag: int = 0

    model_config = ConfigDict(populate_by_name=True)

class Milestone(BaseModel):
    id: int
    name: str
    startDate: str
    endDate: Optional[str] = None
    duration: int
    progress: int = 0
    amount: float
    currency: str = "USD"
    status: str = "PENDING"  # PENDING, IN_PROGRESS, VERIFYING, COMPLETED, DISPUTED
    escrow_status: str = "HELD_IN_ESCROW"  # HELD_IN_ESCROW, RELEASED, PENDING_AUTH, REFUNDED
    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    verification_hash: Optional[str] = None
    github_pr_url: Optional[str] = None
    deliverable_description: Optional[str] = None
    acceptance_criteria: List[str] = Field(default_factory=list)
    predecessors: List[int] = Field(default_factory=list)
    assigned_resource: Optional[str] = "Lead Architect"
    critical_path: bool = False

class MilestoneVerifyRequest(BaseModel):
    github_pr_url: Optional[str] = "https://github.com/milestonepay-ai/defi-engine/pull/42"
    commit_sha: Optional[str] = "a8f9c31405e6b72d"
    test_suite_passed: bool = True
    ai_audit_score: Optional[float] = 98.5
    notes: Optional[str] = "AI automated cryptographic deliverable verification passed."

class MilestonePayoutResult(BaseModel):
    milestone_id: int
    milestone_name: str
    amount: float
    currency: str
    paypal_order_id: str
    paypal_capture_id: str
    escrow_status: str
    status: str
    verification_hash: str
    timestamp: str
    debug_mode: bool
    details: dict
