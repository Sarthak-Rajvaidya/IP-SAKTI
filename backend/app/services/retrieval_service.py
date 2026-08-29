"""
Retrieval service: owns the Qdrant client and implements hybrid-style
retrieval (semantic vector search + metadata filtering + keyword overlap +
authority weighting + jurisdiction weighting), combined into one relevance
score per chunk. This score (not a fabricated LLM number) is what
confidence_service and citation_service consume downstream.
"""
from __future__ import annotations

import logging
import re
import threading
from dataclasses import dataclass, field
from typing import List, Optional

from app.config import get_settings
from app.services.embedding_service import get_embedding_service

logger = logging.getLogger("ip_sakti.retrieval")

VECTOR_PAYLOAD_FIELDS = [
    "document_id", "title", "authority", "jurisdiction", "document_type",
    "source_url", "section", "article", "topic", "ip_category", "language",
    "effective_date", "version", "is_authoritative", "source_type", "text",
    "chunk_id", "sub_title", "status",
]


@dataclass
class RetrievedChunk:
    document_id: str
    chunk_id: str
    title: str
    sub_title: str
    authority: str
    jurisdiction: str
    document_type: str
    source_url: str
    section: str
    topic: str
    ip_category: str
    language: str
    is_authoritative: bool
    source_type: str
    status: str
    text: str
    semantic_score: float
    keyword_score: float = 0.0
    authority_score: float = 0.0
    jurisdiction_score: float = 0.0
    domain_score: float = 0.0
    final_score: float = 0.0


class QdrantUnavailableError(Exception):
    pass


class RetrievalService:
    _instance: Optional["RetrievalService"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._client = None
        self._client_lock = threading.Lock()
        self._connect_error: Optional[str] = None

    @classmethod
    def instance(cls) -> "RetrievalService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = RetrievalService()
        return cls._instance

    def _get_client(self):
        if self._client is not None:
            return self._client
        with self._client_lock:
            if self._client is not None:
                return self._client
            settings = get_settings()
            try:
                from qdrant_client import QdrantClient

                client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key or None,
                    timeout=5.0,
                )
                # cheap connectivity probe
                client.get_collections()
                self._client = client
                return self._client
            except Exception as exc:  # noqa: BLE001
                self._connect_error = str(exc)
                raise QdrantUnavailableError(
                    f"Could not connect to Qdrant at {settings.qdrant_url}: {exc}"
                ) from exc

    def is_available(self) -> bool:
        try:
            self._get_client()
            return True
        except QdrantUnavailableError:
            return False

    def connect_error(self) -> Optional[str]:
        return self._connect_error

    def ensure_collection(self, dimension: int) -> None:
        from qdrant_client.models import Distance, VectorParams

        settings = get_settings()
        client = self._get_client()
        existing = [c.name for c in client.get_collections().collections]
        if settings.qdrant_collection not in existing:
            logger.info("Creating Qdrant collection '%s' (dim=%s)", settings.qdrant_collection, dimension)
            client.create_collection(
                collection_name=settings.qdrant_collection,
                vectors_config=VectorParams(size=dimension, distance=Distance.COSINE),
            )

    def collection_count(self) -> int:
        settings = get_settings()
        client = self._get_client()
        try:
            info = client.count(collection_name=settings.qdrant_collection, exact=True)
            return info.count
        except Exception:  # noqa: BLE001 - collection may not exist yet
            return 0

    def upsert(self, points: list) -> None:
        settings = get_settings()
        client = self._get_client()
        client.upsert(collection_name=settings.qdrant_collection, points=points)

    # ------------------------------------------------------------------
    # Hybrid retrieval
    # ------------------------------------------------------------------
    def search(
        self,
        query: str,
        jurisdiction: str,
        domains: List[str],
        top_k: int = 8,
    ) -> List[RetrievedChunk]:
        settings = get_settings()
        embedder = get_embedding_service()
        if not embedder.is_ready():
            raise RuntimeError(f"Embeddings unavailable: {embedder.load_error()}")

        query_vector = embedder.embed_query(query)
        client = self._get_client()

        from qdrant_client.models import FieldCondition, Filter, MatchValue

        # Metadata filter: strictly isolate jurisdiction (core requirement),
        # domain matching is done as a soft score boost below rather than a
        # hard filter, since a query can span multiple domains.
        qfilter = Filter(
            must=[FieldCondition(key="jurisdiction", match=MatchValue(value=jurisdiction))]
        )

        try:
            hits = client.query_points(
                collection_name=settings.qdrant_collection,
                query=query_vector,
                query_filter=qfilter,
                limit=max(top_k * 3, top_k),
                with_payload=True,
            ).points
        except Exception as exc:  # noqa: BLE001
            raise QdrantUnavailableError(f"Qdrant query failed: {exc}") from exc

        query_terms = set(re.findall(r"[a-zA-Z]{3,}", query.lower()))

        chunks: List[RetrievedChunk] = []
        for hit in hits:
            payload = hit.payload or {}
            semantic_score = float(hit.score)
            text = payload.get("text", "")
            keyword_score = _keyword_overlap_score(query_terms, text)
            authority_score = 1.0 if payload.get("is_authoritative") else 0.55
            jurisdiction_score = 1.0 if payload.get("jurisdiction") == jurisdiction else 0.0
            ip_category = (payload.get("ip_category") or "").upper()
            domain_score = 1.0 if ip_category in domains else 0.5 if not domains else 0.3

            final_score = (
                0.55 * semantic_score
                + 0.15 * keyword_score
                + 0.15 * authority_score
                + 0.10 * jurisdiction_score
                + 0.05 * domain_score
            )

            chunks.append(
                RetrievedChunk(
                    document_id=payload.get("document_id", str(hit.id)),
                    chunk_id=str(hit.id),
                    title=payload.get("title", "Untitled source"),
                    sub_title=payload.get("sub_title", ""),
                    authority=payload.get("authority", "Unknown"),
                    jurisdiction=payload.get("jurisdiction", jurisdiction),
                    document_type=payload.get("document_type", "Document"),
                    source_url=payload.get("source_url", ""),
                    section=payload.get("section", ""),
                    topic=payload.get("topic", ""),
                    ip_category=payload.get("ip_category", ""),
                    language=payload.get("language", "en"),
                    is_authoritative=bool(payload.get("is_authoritative", False)),
                    source_type=payload.get("source_type", "demo"),
                    status=payload.get("status", "review"),
                    text=text,
                    semantic_score=semantic_score,
                    keyword_score=keyword_score,
                    authority_score=authority_score,
                    jurisdiction_score=jurisdiction_score,
                    domain_score=domain_score,
                    final_score=final_score,
                )
            )

        chunks.sort(key=lambda c: c.final_score, reverse=True)
        return chunks[:top_k]


def _keyword_overlap_score(query_terms: set, text: str) -> float:
    if not query_terms:
        return 0.0
    text_terms = set(re.findall(r"[a-zA-Z]{3,}", text.lower()))
    if not text_terms:
        return 0.0
    overlap = query_terms & text_terms
    return min(1.0, len(overlap) / max(1, len(query_terms)))


def get_retrieval_service() -> RetrievalService:
    return RetrievalService.instance()
