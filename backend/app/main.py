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
from app.services.llm_service import get_llm_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

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
    """
    Lightweight health check.

    This endpoint intentionally does NOT load the embedding model
    or make a Qdrant network request. This keeps the health endpoint
    fast and prevents Render health checks from timing out while
    SentenceTransformer models are loading on CPU.
    """

    # Check configuration only.
    # Do NOT call embedding_service.is_ready() here because that
    # triggers SentenceTransformer model loading.
    embeddings_status = "configured"

    # Check whether Qdrant URL is configured.
    # Do NOT call retrieval.is_available() here because that performs
    # a network request to Qdrant.
    qdrant_configured = bool(settings.qdrant_url)

    qdrant_status = (
        "configured"
        if qdrant_configured
        else "not configured"
    )

    # Gemini configuration check is lightweight.
    llm = get_llm_service()
    gemini_configured = llm.is_configured()

    gemini_status = (
        "configured"
        if gemini_configured
        else "not configured (set GEMINI_API_KEY)"
    )

    # This endpoint reports application configuration/availability,
    # not an expensive live dependency check.
    overall = (
        "ok"
        if qdrant_configured and gemini_configured
        else "degraded"
    )

    return HealthResponse(
        status=overall,
        gemini=gemini_status,
        qdrant=qdrant_status,
        embeddings=embeddings_status,
        collection=settings.qdrant_collection if qdrant_configured else None,
        vectorCount=None,
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
    return {
        "name": "IP-SAKTI API",
        "docs": "/docs",
        "health": "/api/health",
    }