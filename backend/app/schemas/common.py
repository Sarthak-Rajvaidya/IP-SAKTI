from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Jurisdiction(str, Enum):
    india = "india"
    international = "international"


class ConfidenceLevel(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class SourceStatus(str, Enum):
    verified = "verified"
    review = "review"
    international = "international"


class Source(BaseModel):
    id: str
    title: str
    subTitle: Optional[str] = None
    jurisdiction: Jurisdiction
    documentType: str
    authority: str
    lastUpdated: str
    status: SourceStatus
    url: str
    isMock: bool = False
    # Backend-only metadata, additive — the frontend Source type simply
    # ignores fields it doesn't know about.
    sourceType: str = Field(default="demo", description="'demo' or 'authoritative'")
    isAuthoritative: bool = False
    relevanceScore: Optional[float] = None
    snippet: Optional[str] = None


class ConfigResponse(BaseModel):
    appEnv: str
    geminiConfigured: bool
    qdrantConfigured: bool
    embeddingModel: str
    geminiModel: str
    defaultLanguage: str
    supportedLanguages: list[str]
    debugMode: bool


class HealthResponse(BaseModel):
    status: str
    gemini: str
    qdrant: str
    embeddings: str
    collection: Optional[str] = None
    vectorCount: Optional[int] = None
