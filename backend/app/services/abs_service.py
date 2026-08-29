"""
ABS (Access & Benefit Sharing) advisor service.

Combines a transparent heuristic (matching the spec's required
resource/origin/commercialIntent/entityType/useType inputs) with retrieval
grounding: it searches the ABS/biodiversity domain in Qdrant so the result
can cite real (or demo-labelled) sources rather than asserting a bare
conclusion.
"""
from __future__ import annotations

import logging

from app.schemas.abs import ABSRequest, ABSResult
from app.schemas.common import ConfidenceLevel, Jurisdiction
from app.services.citation_service import build_validated_sources
from app.services.confidence_service import estimate_confidence
from app.services.retrieval_service import get_retrieval_service, QdrantUnavailableError

logger = logging.getLogger("ip_sakti.abs")


def assess_abs(payload: ABSRequest) -> ABSResult:
    resource = payload.resource or "this biological resource"
    origin = payload.origin or "India"
    jurisdiction = Jurisdiction.india if origin.lower() != "outside india" else Jurisdiction.international

    query = f"Access and benefit sharing obligations for {resource} sourced from {origin}, commercial use {payload.useType}"

    sources = []
    try:
        service = get_retrieval_service()
        chunks = service.search(
            query=query,
            jurisdiction=jurisdiction.value,
            domains=["ABS_BIODIVERSITY"],
            top_k=4,
        )
        cited_ids = [c.document_id for c in chunks]
        sources = build_validated_sources(chunks, cited_ids)
        confidence_result = estimate_confidence(chunks, min_confidence=0.0)
        confidence = confidence_result.score
        confidence_level = confidence_result.level
    except (QdrantUnavailableError, RuntimeError) as exc:
        logger.warning("ABS retrieval unavailable, falling back to heuristic only: %s", exc)
        confidence = 40
        confidence_level = ConfidenceLevel.low

    if payload.commercialIntent:
        status = "review-recommended"
        headline = "Potential ABS Review Required"
        reasoning = (
            f"{resource} is sourced from {origin} and involves intended commercial use by a "
            f"{payload.entityType.lower() or 'commercial entity'}. This combination typically "
            "triggers Access & Benefit Sharing review under the Biological Diversity framework."
        )
        next_steps = [
            "Identify the applicable State Biodiversity Board or National Biodiversity Authority",
            "Check whether prior access approval is required before commercialisation",
            "Review benefit-sharing obligations with local communities or providers",
            "Maintain documentation of the resource's source and chain of custody",
        ]
    else:
        status = "likely-exempt"
        headline = "ABS Review Likely Not Required"
        reasoning = (
            "Based on the information provided, this appears to be non-commercial or research "
            "use, which may fall under a lighter-touch ABS pathway. This should still be "
            "confirmed with the relevant authority."
        )
        next_steps = [
            "Confirm exemption status with the National Biodiversity Authority",
            "Re-assess if the use case shifts toward commercialisation",
            "Maintain documentation regardless of exemption status",
        ]

    return ABSResult(
        status=status,
        headline=headline,
        reasoning=reasoning,
        nextSteps=next_steps,
        jurisdiction=jurisdiction,
        confidence=confidence,
        confidenceLevel=confidence_level,
        sources=sources,
    )
