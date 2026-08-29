"""
Local multilingual embedding service.

Wraps sentence-transformers so the model is loaded exactly once per process
(module-level singleton) and reused for every request. Defaults to
BAAI/bge-m3; if that fails to load (e.g. too heavy for the machine, or the
model can't be downloaded because there's no network), it transparently
falls back to a much lighter multilingual MiniLM model, and if THAT also
fails, embedding-dependent features degrade gracefully (see rag_service /
retrieval_service, which check `embedding_service.is_ready()` before use).
"""
from __future__ import annotations

import logging
import threading
from typing import List, Optional

import numpy as np

from app.config import get_settings

logger = logging.getLogger("ip_sakti.embedding")


class EmbeddingService:
    _instance: Optional["EmbeddingService"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._model = None
        self._model_name: Optional[str] = None
        self._dimension: Optional[int] = None
        self._load_error: Optional[str] = None
        self._load_lock = threading.Lock()

    @classmethod
    def instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = EmbeddingService()
        return cls._instance

    def _ensure_loaded(self) -> None:
        if self._model is not None or self._load_error is not None:
            return
        with self._load_lock:
            if self._model is not None or self._load_error is not None:
                return
            settings = get_settings()
            candidates = [settings.embedding_model, settings.embedding_fallback_model]
            last_err: Optional[Exception] = None
            for name in candidates:
                try:
                    from sentence_transformers import SentenceTransformer  # local import: heavy

                    logger.info("Loading embedding model: %s", name)
                    model = SentenceTransformer(name)
                    self._model = model
                    self._model_name = name
                    self._dimension = model.get_sentence_embedding_dimension()
                    logger.info("Embedding model loaded: %s (dim=%s)", name, self._dimension)
                    return
                except Exception as exc:  # noqa: BLE001 - want to try fallback regardless of error type
                    logger.warning("Failed to load embedding model %s: %s", name, exc)
                    last_err = exc
                    continue
            self._load_error = str(last_err) if last_err else "Unknown embedding load failure"

    def is_ready(self) -> bool:
        self._ensure_loaded()
        return self._model is not None

    def load_error(self) -> Optional[str]:
        self._ensure_loaded()
        return self._load_error

    @property
    def model_name(self) -> Optional[str]:
        return self._model_name

    @property
    def dimension(self) -> Optional[int]:
        self._ensure_loaded()
        return self._dimension

    def embed_documents(self, texts: List[str]) -> np.ndarray:
        self._ensure_loaded()
        if self._model is None:
            raise RuntimeError(f"Embedding model unavailable: {self._load_error}")
        vectors = self._model.encode(
            texts,
            batch_size=16,
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return vectors

    def embed_query(self, text: str) -> List[float]:
        self._ensure_loaded()
        if self._model is None:
            raise RuntimeError(f"Embedding model unavailable: {self._load_error}")
        vector = self._model.encode(
            [text],
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )[0]
        return vector.tolist()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService.instance()
