"""
Central application configuration.

Everything is read from environment variables (via a `.env` file in
development). Nothing here should ever crash the app on import — missing
values are surfaced as configuration errors at the point of use (see
`app/services/*`), not at import time. This lets `uvicorn app.main:app`
boot even when Gemini/Qdrant aren't configured yet, so `/api/health` and
`/api/config` can report what's missing.
"""
from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Embeddings
    embedding_model: str = "BAAI/bge-m3"
    embedding_fallback_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "ip_sakti_knowledge"

    # Language
    default_language: str = "en"
    supported_languages: str = "en,hi,mr"

    # RAG tuning
    rag_top_k: int = 8
    rag_min_relevance: float = 0.45
    rag_min_confidence: float = 0.45

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Bhashini (optional)
    bhashini_api_key: str = ""
    bhashini_user_id: str = ""
    bhashini_api_url: str = ""

    # App
    app_env: str = "development"
    debug_mode: bool = False

    # Persistence
    sqlite_path: str = "./data/ip_sakti.db"

    @property
    def supported_languages_list(self) -> List[str]:
        return [x.strip() for x in self.supported_languages.split(",") if x.strip()]

    @property
    def cors_origins_list(self) -> List[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
