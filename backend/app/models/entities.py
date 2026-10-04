import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), default="CLIENT")  # CLIENT | FREELANCER | ADMIN
    full_name = Column(String(255), nullable=True)
    paypal_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    contracts_as_client = relationship("Contract", back_populates="client", foreign_keys="Contract.client_id")
    contracts_as_freelancer = relationship("Contract", back_populates="freelancer", foreign_keys="Contract.freelancer_id")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_escrow = Column(Float, nullable=False, default=0.0)
    total_released = Column(Float, default=0.0)
    currency = Column(String(8), default="USD")
    status = Column(String(32), default="ACTIVE")  # ACTIVE | COMPLETED | DISPUTED
    paypal_auth_order_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    client = relationship("User", foreign_keys=[client_id], back_populates="contracts_as_client")
    freelancer = relationship("User", foreign_keys=[freelancer_id], back_populates="contracts_as_freelancer")
    milestones = relationship("Milestone", back_populates="contract", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    contract_id = Column(String(64), ForeignKey("contracts.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    start_date = Column(String(32), nullable=False)
    duration_days = Column(Integer, default=5)
    progress = Column(Integer, default=0)
    status = Column(String(32), default="PENDING")  # PENDING | IN_PROGRESS | VERIFYING | COMPLETED | DISPUTED
    escrow_status = Column(String(32), default="HELD_IN_ESCROW")  # HELD_IN_ESCROW | RELEASED | PENDING_AUTH | REFUNDED
    paypal_order_id = Column(String(64), nullable=True)
    paypal_capture_id = Column(String(64), nullable=True)
    github_pr_url = Column(String(512), nullable=True)
    proof_hash = Column(String(128), nullable=True)
    assigned_resource = Column(String(128), default="Lead Architect")
    critical_path = Column(Boolean, default=False)
    acceptance_criteria = Column(Text, default="[]")  # JSON encoded list of criteria
    predecessors = Column(Text, default="[]")  # JSON encoded list of ints

    contract = relationship("Contract", back_populates="milestones")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    event_type = Column(String(64), nullable=False)
    contract_id = Column(String(64), nullable=True, index=True)
    milestone_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    payload = Column(Text, default="{}")  # JSON encoded event metadata
    hash = Column(String(128), nullable=True)
    severity = Column(String(16), default="INFO")
    amount = Column(Float, nullable=True)
    currency = Column(String(8), default="USD")
    paypal_order_id = Column(String(64), nullable=True)
    paypal_capture_id = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=utc_now)

class PlatformRevenue(Base):
    __tablename__ = "platform_revenue"

    id = Column(String(64), primary_key=True, index=True)
    contract_id = Column(String(64), nullable=False, index=True)
    milestone_id = Column(Integer, nullable=False)
    milestone_amount = Column(Float, nullable=False)
    take_rate_pct = Column(Float, default=0.02)  # 2.0%
    take_rate_amount = Column(Float, nullable=False)  # 2% fee captured by platform
    net_freelancer_amount = Column(Float, nullable=False)  # 98% disbursed
    currency = Column(String(8), default="USD")
    paypal_capture_id = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=utc_now)
