from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.services.llm_service import GeminiConfigError
from app.services.rag_service import ask_assistant
from app.services.retrieval_service import QdrantUnavailableError

logger = logging.getLogger("ip_sakti.api.assistant")

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/ask", response_model=AssistantResponse)
def ask(request: AssistantRequest) -> AssistantResponse:
    try:
        return ask_assistant(request)
    except GeminiConfigError as exc:
        raise HTTPException(status_code=503, detail=f"Configuration error: {exc}") from exc
    except QdrantUnavailableError as exc:
        raise HTTPException(status_code=503, detail=f"RAG service error — Qdrant unavailable: {exc}") from exc
    except RuntimeError as exc:
        # embedding-service failures surface as RuntimeError from embedding_service
        raise HTTPException(status_code=503, detail=f"RAG service error: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /api/assistant/ask")
        raise HTTPException(status_code=500, detail="Unexpected server error while generating the answer.") from exc
