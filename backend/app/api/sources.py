from __future__ import annotations

from fastapi import APIRouter

from app.schemas.source import SourcesResponse
from app.services.sources_service import get_sources_service

router = APIRouter(prefix="/api/sources", tags=["sources"])


@router.get("", response_model=SourcesResponse)
def list_sources() -> SourcesResponse:
    india, international = get_sources_service().get_all()
    return SourcesResponse(india=india, international=international)
