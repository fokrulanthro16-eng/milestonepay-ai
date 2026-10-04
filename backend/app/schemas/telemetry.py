from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditEvent(BaseModel):
    id: str
    event_type: str  # DECOMPOSE, ESCROW_LOCKED, PR_VERIFICATION, PAYPAL_CAPTURE, DISPUTE_ALERT
    milestone_id: Optional[int] = None
    title: str
    description: str
    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "USD"
    verification_hash: Optional[str] = None
    timestamp: str
    severity: str = "INFO"  # INFO, SUCCESS, WARNING, ERROR
    metadata: Dict[str, Any] = {}
