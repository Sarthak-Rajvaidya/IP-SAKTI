"""
Lightweight local persistence using SQLite via SQLModel.

This intentionally implements a small repository interface
(`add_history_item`, `list_history`, `add_escalation`) so a future
PostgreSQL-backed implementation can be swapped in without touching the API
layer. See README "Future PostgreSQL integration" for what that migration
would add (users, audit logs, feedback, source versioning).
"""
from __future__ import annotations

import os
import threading
import uuid
from datetime import datetime, timezone, date
from typing import List, Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select

from app.config import get_settings


class HistoryItemDB(SQLModel, table=True):
    __tablename__ = "history_items"
    id: str = Field(primary_key=True)
    query: str
    jurisdiction: str
    confidence_level: str
    date: str


class EscalationDB(SQLModel, table=True):
    __tablename__ = "escalations"
    ticket_id: str = Field(primary_key=True)
    query: str
    area_of_concern: str
    jurisdiction: str
    contact_preference: str
    status: str = "pending-review"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


_engine = None
_engine_lock = threading.Lock()


def get_engine():
    global _engine
    if _engine is not None:
        return _engine
    with _engine_lock:
        if _engine is not None:
            return _engine
        settings = get_settings()
        db_path = settings.sqlite_path
        os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
        _engine = create_engine(f"sqlite:///{db_path}", echo=False)
        SQLModel.metadata.create_all(_engine)
        return _engine


def reset_engine_for_tests() -> None:
    """Test-only helper: forces get_engine() to reconnect (e.g. after
    changing SQLITE_PATH) instead of reusing the cached engine instance."""
    global _engine
    _engine = None


def add_history_item(query: str, jurisdiction: str, confidence_level: str) -> HistoryItemDB:
    item = HistoryItemDB(
        id=f"h-{uuid.uuid4().hex[:10]}",
        query=query,
        jurisdiction=jurisdiction,
        confidence_level=confidence_level,
        date=date.today().isoformat(),
    )
    with Session(get_engine()) as session:
        session.add(item)
        session.commit()
        session.refresh(item)
    return item


def list_history(limit: int = 50) -> List[HistoryItemDB]:
    with Session(get_engine()) as session:
        statement = select(HistoryItemDB).order_by(HistoryItemDB.date.desc()).limit(limit)
        return list(session.exec(statement))


def add_escalation(query: str, area_of_concern: str, jurisdiction: str, contact_preference: str) -> EscalationDB:
    ticket = EscalationDB(
        ticket_id=f"ESC-{uuid.uuid4().hex[:6].upper()}",
        query=query,
        area_of_concern=area_of_concern,
        jurisdiction=jurisdiction,
        contact_preference=contact_preference,
    )
    with Session(get_engine()) as session:
        session.add(ticket)
        session.commit()
        session.refresh(ticket)
    return ticket
