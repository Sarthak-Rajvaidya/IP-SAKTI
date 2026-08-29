"""
RAG service — the real pipeline behind POST /api/assistant/ask.

    query -> language detection -> intent -> jurisdiction routing ->
    domain routing -> multilingual embedding -> Qdrant retrieval ->
    metadata filtering (done inside retrieval_service) -> hybrid re-ranking
    -> safe-abstention gate -> context assembly -> Gemini -> citation
    validation -> confidence scoring -> AssistantResponse

Infra failures (embeddings unavailable, Qdrant unreachable, Gemini
unconfigured) are raised as exceptions and are NOT caught here — the API
layer (`app/api/assistant.py`) turns them into clear HTTP error responses.
This function never silently falls back to an un-grounded LLM answer.
"""
from __future__ import annotations

import time
import uuid
from pathlib import Path
from typing import List

from app.config import get_settings
from app.schemas.assistant import (
    AssistantRequest,
    AssistantResponse,
    RelevantConsideration,
    WhyThisAnswer,
)
from app.services.citation_service import (
    build_validated_sources,
    extract_cited_document_ids,
    strip_uncited_bracket_ids,
)
from app.services.confidence_service import estimate_confidence
from app.services.llm_service import get_llm_service
from app.services.orchestration_service import modules_for_domains
from app.services.persistence_service import add_history_item
from app.services.retrieval_service import RetrievedChunk, get_retrieval_service
from app.services.routing_service import route_query

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "assistant_system.txt"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")

DOMAIN_DISPLAY: dict[str, tuple[str, str]] = {
    "PATENT": ("Patentability", "green"),
    "TRADEMARK": ("Trademark / Branding", "blue"),
    "GI": ("Geographical Indication", "blue"),
    "COPYRIGHT": ("Copyright", "blue"),
    "DESIGN": ("Design Protection", "blue"),
    "TRADE_SECRET": ("Trade Secret", "blue"),
    "PLANT_VARIETY": ("Plant Variety Protection", "blue"),
    "TRADITIONAL_KNOWLEDGE": ("Traditional Knowledge Check", "amber"),
    "ABS_BIODIVERSITY": ("Biological Resource / ABS", "amber"),
    "AYUSH_REGULATORY": ("Regulatory Classification", "blue"),
    "FOOD_NUTRACEUTICAL": ("Food / Nutraceutical Regulation", "blue"),
    "COSMETIC": ("Cosmetic Regulation", "blue"),
    "ADVERTISING": ("Advertising Compliance", "amber"),
    "EXPORT_INTERNATIONAL": ("Export / Market Access", "blue"),
}

SAFE_ABSTENTION_MESSAGE = (
    "I could not retrieve enough authoritative material to answer this reliably. "
    "I can show the sources found so far, or you can request a human facilitator "
    "to review this question."
)


def _context_text(request: AssistantRequest) -> str:
    if not request.context:
        return ""
    c = request.context
    return " ".join(filter(None, [c.productType, c.productName, c.ingredients, c.intendedUse, c.innovationStatus]))


def _product_context_label(request: AssistantRequest) -> str:
    c = request.context
    if not c or not c.innovationStatus:
        return "New proprietary formulation"
    label = c.innovationStatus
    if c.productName:
        label += f" — {c.productName}"
    return label


def _build_llm_context(chunks: List[RetrievedChunk]) -> str:
    parts = []
    for c in chunks:
        header = f"[{c.document_id}] {c.title}"
        if c.section:
            header += f" ({c.section})"
        auth_note = "AUTHORITATIVE" if c.is_authoritative else "DEMO / non-authoritative reference"
        parts.append(f"{header}\nStatus: {auth_note} | Jurisdiction: {c.jurisdiction}\n{c.text}")
    return "\n\n---\n\n".join(parts)


def ask_assistant(request: AssistantRequest) -> AssistantResponse:
    settings = get_settings()
    t0 = time.time()

    routing = route_query(request.query, _context_text(request))
    modules = modules_for_domains(routing.domains)

    retrieval = get_retrieval_service()
    # Raises RuntimeError (embeddings unavailable) or QdrantUnavailableError —
    # intentionally left uncaught so the API layer returns a clear 503.
    chunks = retrieval.search(
        query=request.query,
        jurisdiction=request.jurisdiction.value,
        domains=routing.domains,
        top_k=settings.rag_top_k,
    )

    relevant_chunks = [c for c in chunks if c.final_score >= settings.rag_min_relevance]

    considerations = [
        RelevantConsideration(label=DOMAIN_DISPLAY.get(d, (d.title(), "blue"))[0], signal=DOMAIN_DISPLAY.get(d, (d.title(), "blue"))[1])
        for d in routing.domains
    ]

    response_id = f"resp-{uuid.uuid4().hex[:10]}"

    if not relevant_chunks:
        # Safe abstention: no LLM call, no fabricated answer.
        fallback_sources = build_validated_sources(chunks, [c.document_id for c in chunks[:3]]) if chunks else []
        confidence_result = estimate_confidence(chunks, settings.rag_min_confidence)
        add_history_item(request.query, request.jurisdiction.value, confidence_result.level.value)
        return AssistantResponse(
            id=response_id,
            productContext=_product_context_label(request),
            jurisdiction=request.jurisdiction,
            assessment=SAFE_ABSTENTION_MESSAGE,
            considerations=considerations,
            sources=fallback_sources,
            confidence=confidence_result.score,
            confidenceLevel=confidence_result.level,
            whyThisAnswer=WhyThisAnswer(
                retrievedSourceCount=len(fallback_sources),
                relevantProvisions=[],
                knowledgeAreas=[DOMAIN_DISPLAY.get(d, (d.title(), ""))[0] for d in routing.domains],
                jurisdiction=request.jurisdiction,
            ),
            detectedLanguage=routing.detected_language,
            intent=routing.intent,
            reasoningModulesUsed=modules,
            abstained=True,
            debug=_debug_payload(settings, chunks, t0) if settings.debug_mode else None,
        )

    # --- Real LLM call, grounded only in relevant_chunks ---------------------
    llm = get_llm_service()  # raises GeminiConfigError if unconfigured — left uncaught
    llm_context = _build_llm_context(relevant_chunks)
    lang_note = f"Respond in language code '{request.language}' where practical." if request.language != "en" else ""
    user_prompt = (
        f"USER QUERY: {request.query}\n\n"
        f"JURISDICTION: {request.jurisdiction.value}\n\n"
        f"PRODUCT CONTEXT: {_context_text(request) or 'Not provided'}\n\n"
        f"{lang_note}\n\n"
        f"RETRIEVED EVIDENCE CHUNKS:\n\n{llm_context}"
    )
    llm_text = llm.generate(SYSTEM_PROMPT, user_prompt)

    cited_ids = extract_cited_document_ids(llm_text)
    validated_sources = build_validated_sources(relevant_chunks, cited_ids)
    valid_id_set = [s.id for s in validated_sources]
    clean_text = strip_uncited_bracket_ids(llm_text, valid_id_set).strip()

    confidence_result = estimate_confidence(relevant_chunks, settings.rag_min_confidence)

    provisions = []
    for c in relevant_chunks[:4]:
        label = f"{c.section}, {c.title}" if c.section else c.title
        if label not in provisions:
            provisions.append(label)

    add_history_item(request.query, request.jurisdiction.value, confidence_result.level.value)

    return AssistantResponse(
        id=response_id,
        productContext=_product_context_label(request),
        jurisdiction=request.jurisdiction,
        assessment=clean_text,
        considerations=considerations,
        sources=validated_sources,
        confidence=confidence_result.score,
        confidenceLevel=confidence_result.level,
        whyThisAnswer=WhyThisAnswer(
            retrievedSourceCount=len(validated_sources),
            relevantProvisions=provisions,
            knowledgeAreas=[DOMAIN_DISPLAY.get(d, (d.title(), ""))[0] for d in routing.domains],
            jurisdiction=request.jurisdiction,
        ),
        detectedLanguage=routing.detected_language,
        intent=routing.intent,
        productClassification=request.context.innovationStatus if request.context else None,
        reasoningModulesUsed=modules,
        abstained=False,
        debug=_debug_payload(settings, relevant_chunks, t0) if settings.debug_mode else None,
    )


def _debug_payload(settings, chunks: List[RetrievedChunk], t0: float) -> dict:
    return {
        "retrieval_count": len(chunks),
        "top_sources": [c.document_id for c in chunks[:5]],
        "retrieval_scores": [round(c.final_score, 3) for c in chunks[:5]],
        "latency_ms": int((time.time() - t0) * 1000),
        "embedding_model": settings.embedding_model,
        "gemini_model": settings.gemini_model,
    }
