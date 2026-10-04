import pytest
import asyncio
from app.core.init_db import init_db
from app.api.endpoints import load_preset

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Auto-initialize database tables and seed demo users for test session."""
    init_db()
    asyncio.run(load_preset("defi"))
    yield
