from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.abs import ABSRequest, ABSResult
from app.services.abs_service import assess_abs

logger = logging.getLogger("ip_sakti.api.abs")

router = APIRouter(prefix="/api/abs", tags=["abs"])


@router.post("/assess", response_model=ABSResult)
def assess(request: ABSRequest) -> ABSResult:
    try:
        return assess_abs(request)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /api/abs/assess")
        raise HTTPException(status_code=500, detail="Unexpected server error during ABS assessment.") from exc
