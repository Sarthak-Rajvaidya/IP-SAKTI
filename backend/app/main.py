from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import abs as abs_api
from app.api import assistant as assistant_api
from app.api import classification as classification_api
from app.api import escalation as escalation_api
from app.api import history as history_api
from app.api import knowledge as knowledge_api
from app.api import sources as sources_api
from app.config import get_settings
from app.schemas.common import ConfigResponse, HealthResponse
from app.services.embedding_service import get_embedding_service
from app.services.llm_service import get_llm_service
from app.services.retrieval_service import get_retrieval_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("ip_sakti.main")

settings = get_settings()

app = FastAPI(
    title="IP-SAKTI API",
    description="Intelligent IP & Regulatory Sahayak for Ayurveda — backend API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assistant_api.router)
app.include_router(classification_api.router)
app.include_router(sources_api.router)
app.include_router(knowledge_api.router)
app.include_router(abs_api.router)
app.include_router(history_api.router)
app.include_router(escalation_api.router)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Cheap, non-blocking-ish status check for each dependency. Does not
    raise — always returns 200 so the frontend/judges can see exactly what's
    configured, even when nothing is."""
    embedder = get_embedding_service()
    embeddings_status = "ready" if embedder.is_ready() else f"unavailable: {embedder.load_error()}"

    retrieval = get_retrieval_service()
    qdrant_ok = retrieval.is_available()
    qdrant_status = "ready" if qdrant_ok else f"unavailable: {retrieval.connect_error()}"

    vector_count = None
    if qdrant_ok:
        try:
            vector_count = retrieval.collection_count()
        except Exception:  # noqa: BLE001
            vector_count = None

    llm = get_llm_service()
    gemini_status = "configured" if llm.is_configured() else "not configured (set GEMINI_API_KEY)"

    overall = "ok" if (embedder.is_ready() and qdrant_ok and llm.is_configured()) else "degraded"

    return HealthResponse(
        status=overall,
        gemini=gemini_status,
        qdrant=qdrant_status,
        embeddings=embeddings_status,
        collection=settings.qdrant_collection if qdrant_ok else None,
        vectorCount=vector_count,
    )


@app.get("/api/config", response_model=ConfigResponse)
def config() -> ConfigResponse:
    return ConfigResponse(
        appEnv=settings.app_env,
        geminiConfigured=settings.gemini_configured,
        qdrantConfigured=bool(settings.qdrant_url),
        embeddingModel=settings.embedding_model,
        geminiModel=settings.gemini_model,
        defaultLanguage=settings.default_language,
        supportedLanguages=settings.supported_languages_list,
        debugMode=settings.debug_mode,
    )


@app.get("/")
def root() -> dict:
    return {"name": "IP-SAKTI API", "docs": "/docs", "health": "/api/health"}
