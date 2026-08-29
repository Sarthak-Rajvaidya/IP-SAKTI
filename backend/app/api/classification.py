from __future__ import annotations

from fastapi import APIRouter

from app.schemas.classification import ClassificationRequest, ClassificationResult
from app.services.classification_service import classify_product

router = APIRouter(prefix="/api/classification", tags=["classification"])


@router.post("", response_model=ClassificationResult)
def classify(request: ClassificationRequest) -> ClassificationResult:
    return classify_product(request.answers)
