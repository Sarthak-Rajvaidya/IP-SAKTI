from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceLevel, Jurisdiction, Source


class ProductContext(BaseModel):
    productType: str = ""
    productName: str = ""
    ingredients: str = ""
    intendedUse: str = ""
    targetMarket: str = ""
    innovationStatus: str = ""


class AssistantRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    jurisdiction: Jurisdiction = Jurisdiction.india
    context: Optional[ProductContext] = None
    language: str = "en"


class RelevantConsideration(BaseModel):
    label: str
    signal: str  # 'green' | 'amber' | 'blue'


class WhyThisAnswer(BaseModel):
    retrievedSourceCount: int
    relevantProvisions: List[str]
    knowledgeAreas: List[str]
    jurisdiction: Jurisdiction


class RetrievedChunkDebug(BaseModel):
    sourceId: str
    title: str
    score: float
    snippet: str


class AssistantResponse(BaseModel):
    id: str
    productContext: str
    jurisdiction: Jurisdiction
    assessment: str
    considerations: List[RelevantConsideration]
    sources: List[Source]
    confidence: int
    confidenceLevel: ConfidenceLevel
    whyThisAnswer: WhyThisAnswer

    # Additive backend fields (frontend safely ignores unknown fields)
    detectedLanguage: Optional[str] = None
    intent: Optional[str] = None
    productClassification: Optional[str] = None
    reasoningModulesUsed: List[str] = []
    abstained: bool = False
    debug: Optional[dict] = None
