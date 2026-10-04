import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_github_webhook_pr_merged():
    # Payload simulating GitHub PR merged for Milestone #1
    payload = {
        "action": "closed",
        "pull_request": {
            "number": 42,
            "title": "feat: smart contracts & audit [Milestone #1]",
            "body": "Closes milestone 1 deliverables. Slither audit passed 0 high findings.",
            "merged": True,
            "html_url": "https://github.com/milestonepay-ai/defi-exchange/pull/42",
            "head": {
                "sha": "7f9a8b11c03e84d1fa34"
            }
        }
    }

    res = client.post("/api/webhooks/github", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("success", "handled")
    if data["status"] == "success":
        assert data["event"] == "GITHUB_PR_VERIFIED_AND_RELEASED"
        assert data["platform_take_rate_2pct"] > 0
        assert data["net_disbursed_to_freelancer"] > 0
        # Check take rate is exactly 2% of gross
        expected_fee = round(data["gross_milestone_amount"] * 0.02, 2)
        assert abs(data["platform_take_rate_2pct"] - expected_fee) < 0.05
        assert "paypal_capture_id" in data
        assert "verification_hash" in data

def test_paypal_webhook_capture_completed():
    payload = {
        "id": "WH-9921481024",
        "event_version": "1.0",
        "create_time": "2026-10-05T00:30:00Z",
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource_type": "capture",
        "resource": {
            "id": "PP-CAP-WH-881290",
            "status": "COMPLETED",
            "amount": {
                "currency_code": "USD",
                "value": "700.00"
            }
        }
    }

    res = client.post("/api/webhooks/paypal", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["event_type"] == "PAYMENT.CAPTURE.COMPLETED"
    assert data["capture_id"] == "PP-CAP-WH-881290"

def test_platform_revenue_endpoint():
    res = client.get("/api/webhooks/platform/revenue")
    assert res.status_code == 200
    data = res.json()
    assert data["platform_fee_pct"] == 2.0
    assert "total_gross_processed" in data
    assert "total_platform_revenue" in data
    assert "total_freelancer_disbursed" in data
    assert "recent_fee_transactions" in data
