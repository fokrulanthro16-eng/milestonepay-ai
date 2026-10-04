from typing import List, Optional
from pydantic import BaseModel, Field
from .milestone import Milestone, BryntumDependency

class ContractDecomposeRequest(BaseModel):
    raw_contract_text: str
    project_title: Optional[str] = None
    total_budget: Optional[float] = None
    currency: str = "USD"
    freelancer_email: Optional[str] = "freelancer-seller@milestonepay.ai"
    employer_email: Optional[str] = "employer-buyer@milestonepay.ai"

class BryntumProjectData(BaseModel):
    project_id: str
    title: str
    currency: str = "USD"
    total_budget: float
    total_released: float = 0.0
    total_in_escrow: float = 0.0
    paypal_auth_order_id: Optional[str] = None
    tasks: List[Milestone] = Field(default_factory=list)
    dependencies: List[BryntumDependency] = Field(default_factory=list)
    created_at: str
    sla_hours: int = 48
    dispute_grace_period_days: int = 7

class EscrowStatusSummary(BaseModel):
    project_id: str
    title: str
    total_budget: float
    total_in_escrow: float
    total_released: float
    milestones_count: int
    completed_milestones: int
    pending_milestones: int
    paypal_auth_order_id: Optional[str]
    paypal_status: str
    is_live_sandbox: bool
    platform_take_rate_pct: float = 2.0
    total_platform_revenue: float = 0.0
    net_freelancer_disbursed: float = 0.0
