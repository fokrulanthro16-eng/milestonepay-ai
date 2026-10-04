import pytest
import uuid
import datetime
from app.core.database import SessionLocal
from app.models.entities import User, Contract, Milestone, AuditLog, PlatformRevenue

def test_database_orm_entities():
    db = SessionLocal()
    try:
        # Create a test client
        test_client = User(
            email=f"client-{uuid.uuid4().hex[:6]}@corp.io",
            hashed_password="hash",
            role="CLIENT",
            full_name="Alpha DAO"
        )
        db.add(test_client)
        db.commit()
        db.refresh(test_client)
        assert test_client.id is not None

        # Create a test contract
        contract_id = f"PRJ-{uuid.uuid4().hex[:6].upper()}"
        contract = Contract(
            id=contract_id,
            title="DeFi Liquidity Engine",
            client_id=test_client.id,
            total_escrow=2800.0,
            currency="USD",
            status="ACTIVE",
            paypal_auth_order_id="PP-AUTH-882"
        )
        db.add(contract)
        db.commit()

        # Create a milestone
        milestone = Milestone(
            contract_id=contract_id,
            name="Smart Contracts",
            amount=700.0,
            currency="USD",
            start_date="2026-10-05",
            duration_days=4,
            progress=100,
            status="COMPLETED",
            escrow_status="RELEASED",
            paypal_capture_id="PP-CAP-999"
        )
        db.add(milestone)
        db.commit()
        db.refresh(milestone)

        # Create platform revenue record (2% take-rate)
        rev = PlatformRevenue(
            id=f"REV-{uuid.uuid4().hex[:6].upper()}",
            contract_id=contract_id,
            milestone_id=milestone.id,
            milestone_amount=700.0,
            take_rate_pct=0.02,
            take_rate_amount=14.00,
            net_freelancer_amount=686.00,
            currency="USD",
            paypal_capture_id="PP-CAP-999"
        )
        db.add(rev)
        db.commit()

        # Query verification
        fetched_rev = db.query(PlatformRevenue).filter(PlatformRevenue.contract_id == contract_id).first()
        assert fetched_rev is not None
        assert fetched_rev.take_rate_amount == 14.00
        assert fetched_rev.net_freelancer_amount == 686.00

    finally:
        db.close()
