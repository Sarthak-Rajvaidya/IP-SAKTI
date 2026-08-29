from __future__ import annotations

from typing import List

from pydantic import BaseModel


class ClassificationAnswer(BaseModel):
    step: int
    question: str
    answer: str


class ClassificationRequest(BaseModel):
    answers: List[ClassificationAnswer]


class ClassificationResult(BaseModel):
    label: str
    confidence: int
    reasons: List[str]
    nextSteps: List[str]

    # Additive backend fields
    category: str | None = None
    uncertaintyFlags: List[str] = []
