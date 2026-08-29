"""
Confidence estimation.

Deliberately computed from retrieval evidence (source count, relevance
scores, authority, jurisdiction match, agreement across sources) rather
than asked from the LLM — the project spec is explicit that Gemini must
not be allowed to invent this number.
"""
from __future__ import annotations

from dataclasses import dataclass
from statistics import mean, pstdev
from typing import List

from app.schemas.common import ConfidenceLevel
from app.services.retrieval_service import RetrievedChunk


@dataclass
class ConfidenceResult:
    score: int  # 0-100
    level: ConfidenceLevel
    meets_threshold: bool


def estimate_confidence(chunks: List[RetrievedChunk], min_confidence: float) -> ConfidenceResult:
    if not chunks:
        return ConfidenceResult(score=0, level=ConfidenceLevel.low, meets_threshold=False)

    scores = [c.final_score for c in chunks]
    avg_relevance = mean(scores)
    # Agreement: low spread across top sources implies corroboration.
    spread = pstdev(scores) if len(scores) > 1 else 0.0
    agreement_bonus = max(0.0, 0.15 - spread)  # up to +0.15 when sources tightly agree

    authoritative_ratio = sum(1 for c in chunks if c.is_authoritative) / len(chunks)
    coverage_bonus = min(0.10, 0.02 * len(chunks))  # more corroborating sources → small bonus, capped

    raw = avg_relevance + agreement_bonus + (0.10 * authoritative_ratio) + coverage_bonus
    raw = max(0.0, min(1.0, raw))

    score = int(round(raw * 100))
    level = ConfidenceLevel.high if raw >= 0.75 else ConfidenceLevel.medium if raw >= 0.5 else ConfidenceLevel.low
    meets_threshold = raw >= min_confidence

    return ConfidenceResult(score=score, level=level, meets_threshold=meets_threshold)
