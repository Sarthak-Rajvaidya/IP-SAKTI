from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from app.schemas.common import ConfidenceLevel, Jurisdiction, Source


class ABSRequest(BaseModel):
    resource: str = ""
    origin: str = ""
    commercialIntent: bool = False
    entityType: str = ""
    useType: str = ""


class ABSResult(BaseModel):
    status: str  # 'review-recommended' | 'likely-required' | 'likely-exempt'
    headline: str
    reasoning: str
    nextSteps: List[str]

    # Additive
    jurisdiction: Jurisdiction = Jurisdiction.india
    confidence: int = 0
    confidenceLevel: ConfidenceLevel = ConfidenceLevel.medium
    sources: List[Source] = []


class HistoryItem(BaseModel):
    id: str
    query: str
    jurisdiction: Jurisdiction
    confidenceLevel: ConfidenceLevel
    date: str


class EscalationRequest(BaseModel):
    query: str
    areaOfConcern: str
    jurisdiction: str
    contactPreference: str


class EscalationResponse(BaseModel):
    ticketId: str
    status: str = "pending-review"
