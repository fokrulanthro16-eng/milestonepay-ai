import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "sb-demo-client-id")
    PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "sb-demo-client-secret")
    PAYPAL_API_BASE: str = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
    FRONTEND_PORT: int = int(os.getenv("FRONTEND_PORT", "5173"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

    # Enterprise Database & SaaS Config
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./milestonepay.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "milestonepay-ai-production-jwt-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    PLATFORM_TAKE_RATE_PCT: float = 0.02  # 2% Monetization Take-Rate

    @property
    def is_paypal_sandbox_configured(self) -> bool:
        return bool(
            self.PAYPAL_CLIENT_ID 
            and self.PAYPAL_CLIENT_SECRET 
            and not self.PAYPAL_CLIENT_ID.startswith("sb-demo")
            and not self.PAYPAL_CLIENT_ID.startswith("your_")
        )

    @property
    def is_gemini_configured(self) -> bool:
        return bool(
            self.GEMINI_API_KEY 
            and len(self.GEMINI_API_KEY.strip()) > 10 
            and not self.GEMINI_API_KEY.startswith("your_")
        )

    model_config = {"env_file": ".env", "extra": "allow"}

settings = Settings()
