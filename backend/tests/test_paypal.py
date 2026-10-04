import pytest
from app.core.paypal_client import paypal_client

@pytest.mark.asyncio
async def test_paypal_oauth_token():
    token = await paypal_client.get_access_token()
    assert token is not None
    assert len(token) > 5

@pytest.mark.asyncio
async def test_paypal_create_escrow_order():
    res = await paypal_client.create_milestone_escrow(
        total_amount=2500.0,
        currency="USD",
        project_title="Test Escrow Contract",
        milestones_count=3
    )
    assert res is not None
    assert "order_id" in res
    assert res["status"] in ("CREATED", "AUTHORIZED")
    assert res["intent"] == "AUTHORIZE"
    assert res["total_amount"] == 2500.0

@pytest.mark.asyncio
async def test_paypal_capture_milestone():
    # First create escrow
    escrow = await paypal_client.create_milestone_escrow(
        total_amount=1000.0,
        currency="USD",
        project_title="Test Capture"
    )
    order_id = escrow["order_id"]

    # Headless capture
    capture = await paypal_client.release_milestone_funds(
        order_id=order_id,
        milestone_amount=450.0,
        milestone_id=1,
        currency="USD",
        verification_hash="sha256:abc123test"
    )
    assert capture["success"] is True
    assert capture["status"] == "COMPLETED"
    assert capture["capture_id"] is not None
    assert capture["amount"] == 450.0
