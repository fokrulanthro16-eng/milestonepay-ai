import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.entities import User

client = TestClient(app)

def test_seeded_demo_users_exist():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "client@enterprise.io").first()
        assert user is not None
        assert user.role == "CLIENT"
        
        freelancer = db.query(User).filter(User.email == "freelancer@solidity.dev").first()
        assert freelancer is not None
        assert freelancer.role == "FREELANCER"
    finally:
        db.close()

def test_user_registration_and_login():
    test_email = "newcorp@enterprise.io"
    
    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "role": "CLIENT",
        "full_name": "New Enterprise Corp",
        "paypal_email": "pay@newcorp.io"
    })
    assert reg_res.status_code in (200, 400) # 400 if run multiple times
    
    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_email
    token = data["access_token"]

    # 3. Test /me with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
    assert me_data["role"] == "CLIENT"

def test_login_invalid_password():
    res = client.post("/api/auth/login", json={
        "email": "client@enterprise.io",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401
