from app.core.database import engine, Base, SessionLocal
from app.models.entities import User, Contract, Milestone, AuditLog, PlatformRevenue
from app.core.security import hash_password

def init_db():
    """
    Creates all SQLite/Postgres database tables and seeds demo accounts
    for hackathon evaluators (Client, Freelancer, Admin).
    """
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed Client user
        client = db.query(User).filter(User.email == "client@enterprise.io").first()
        if not client:
            client = User(
                email="client@enterprise.io",
                hashed_password=hash_password("ClientPass123!"),
                role="CLIENT",
                full_name="Nexus Enterprise Corp",
                paypal_email="client-buyer@sandbox.paypal.com"
            )
            db.add(client)

        # Seed Freelancer user
        freelancer = db.query(User).filter(User.email == "freelancer@solidity.dev").first()
        if not freelancer:
            freelancer = User(
                email="freelancer@solidity.dev",
                hashed_password=hash_password("FreelancePass123!"),
                role="FREELANCER",
                full_name="Alex Vance (Lead Architect)",
                paypal_email="freelancer-seller@sandbox.paypal.com"
            )
            db.add(freelancer)

        # Seed Admin user
        admin = db.query(User).filter(User.email == "admin@milestonepay.ai").first()
        if not admin:
            admin = User(
                email="admin@milestonepay.ai",
                hashed_password=hash_password("AdminPass123!"),
                role="ADMIN",
                full_name="MilestonePay AI Ops",
                paypal_email="platform@milestonepay.ai"
            )
            db.add(admin)

        db.commit()
    finally:
        db.close()
