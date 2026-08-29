from __future__ import annotations

from fastapi import APIRouter

from app.schemas.abs import EscalationRequest, EscalationResponse
from app.services.persistence_service import add_escalation

router = APIRouter(prefix="/api/escalate", tags=["escalation"])


@router.post("", response_model=EscalationResponse)
def escalate(request: EscalationRequest) -> EscalationResponse:
    ticket = add_escalation(
        query=request.query,
        area_of_concern=request.areaOfConcern,
        jurisdiction=request.jurisdiction,
        contact_preference=request.contactPreference,
    )
    return EscalationResponse(ticketId=ticket.ticket_id, status=ticket.status)
