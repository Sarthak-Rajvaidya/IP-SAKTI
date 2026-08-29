from __future__ import annotations

from fastapi import APIRouter

from app.services.knowledge_graph_service import get_knowledge_graph_service

router = APIRouter(prefix="/api", tags=["knowledge"])


@router.get("/knowledge-graph")
def knowledge_graph() -> dict:
    return get_knowledge_graph_service().get_graph()
