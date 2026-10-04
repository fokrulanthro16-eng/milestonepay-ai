import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.api.webhooks import router as webhooks_router
from app.api.endpoints import load_preset
from app.core.config import settings
from app.core.init_db import init_db

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[MilestonePay AI] Bootstrapping enterprise backend...")
    # 1. Initialize DB tables & seed demo SaaS users
    try:
        init_db()
        print("[MilestonePay AI] SQLite / PostgreSQL schema initialized and demo users seeded.")
    except Exception as e:
        print(f"[MilestonePay AI] Database init note: {e}")

    # 2. Check Sandbox & AI engine modes
    print(f"[MilestonePay AI] PayPal Sandbox Mode: {'LIVE' if settings.is_paypal_sandbox_configured else 'DETERMINISTIC MOCK'}")
    print(f"[MilestonePay AI] Gemini 2.5 Flash: {'ACTIVE' if settings.is_gemini_configured else 'SMART FALLBACK PARSER'}")
    print(f"[MilestonePay AI] SaaS Platform Take-Rate: {settings.PLATFORM_TAKE_RATE_PCT * 100}%")

    # 3. Pre-seed initial demo scenario for instant Gantt rendering
    try:
        await load_preset("defi")
        print("[MilestonePay AI] Default scenario 'Web3 DeFi Exchange' initialized.")
    except Exception as e:
        print(f"[MilestonePay AI] Preset initialization note: {e}")
    yield

app = FastAPI(
    title="MilestonePay AI Enterprise API",
    description="Autonomous Contract Decomposition, Visual Gantt Milestone Tracker, Multi-tenant Auth, Webhooks & Headless PayPal Escrow Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for frontend Vite dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(webhooks_router, prefix="/api")
app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MilestonePay AI Enterprise",
        "version": "2.0.0",
        "paypal_mode": "SANDBOX" if settings.is_paypal_sandbox_configured else "MOCK_FALLBACK",
        "ai_engine": "Gemini-2.5-Flash" if settings.is_gemini_configured else "Deterministic-Fallback",
        "take_rate_pct": settings.PLATFORM_TAKE_RATE_PCT * 100,
        "database": "Active (SQLite/ORM)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.APP_PORT, reload=settings.DEBUG)
