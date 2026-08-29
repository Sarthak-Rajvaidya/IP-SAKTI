from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def _isolated_sqlite(monkeypatch, tmp_path):
    """Every test gets its own throwaway SQLite file so history/escalation
    tests don't interfere with each other or with a developer's real db."""
    db_path = tmp_path / "test_ip_sakti.db"
    monkeypatch.setenv("SQLITE_PATH", str(db_path))

    from app.config import get_settings

    get_settings.cache_clear()

    from app.services.persistence_service import reset_engine_for_tests

    reset_engine_for_tests()

    yield

    get_settings.cache_clear()
    reset_engine_for_tests()


@pytest.fixture
def client():
    from app.main import app

    return TestClient(app)
