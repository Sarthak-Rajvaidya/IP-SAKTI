"""
Sources service — loads `app/data/sources_registry.json`, which is
generated (and kept up to date) by `scripts/ingest.py` from the actual
corpus documents' frontmatter metadata. This means `GET /api/sources`
always reflects what's really been ingested, rather than a hand-maintained
duplicate list that can drift from the real corpus.
"""
from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Optional

from app.schemas.common import Source

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "data" / "sources_registry.json"


class SourcesService:
    _instance: Optional["SourcesService"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._cache: Optional[dict] = None

    @classmethod
    def instance(cls) -> "SourcesService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = SourcesService()
        return cls._instance

    def _load(self) -> dict:
        if self._cache is None:
            if not REGISTRY_PATH.exists():
                self._cache = {"india": [], "international": []}
            else:
                with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
                    self._cache = json.load(f)
        return self._cache

    def get_all(self) -> tuple[list[Source], list[Source]]:
        data = self._load()
        india = [Source(**s) for s in data.get("india", [])]
        intl = [Source(**s) for s in data.get("international", [])]
        return india, intl


def get_sources_service() -> SourcesService:
    return SourcesService.instance()
