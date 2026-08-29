from __future__ import annotations

from fastapi import APIRouter

from app.schemas.abs import HistoryItem
from app.services.persistence_service import list_history

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[HistoryItem])
def get_history() -> list[HistoryItem]:
    items = list_history()
    return [
        HistoryItem(id=i.id, query=i.query, jurisdiction=i.jurisdiction, confidenceLevel=i.confidence_level, date=i.date)
        for i in items
    ]
