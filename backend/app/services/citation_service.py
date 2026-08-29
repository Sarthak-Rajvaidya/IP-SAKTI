"""
Citation service.

The LLM is instructed (see prompts/assistant_system.txt) to cite retrieved
sources by their [document_id]. This module is the enforcement layer: any
citation the LLM produces that does NOT correspond to an actually-retrieved
chunk is stripped out. The LLM cannot introduce sources into the response
that weren't retrieved — this is what makes the citation list trustworthy.
"""
from __future__ import annotations

import re
from typing import List

from app.schemas.common import Source, SourceStatus, Jurisdiction
from app.services.retrieval_service import RetrievedChunk

CITATION_PATTERN = re.compile(r"\[([a-zA-Z0-9_\-]+)\]")


def extract_cited_document_ids(llm_text: str) -> List[str]:
    return list(dict.fromkeys(CITATION_PATTERN.findall(llm_text)))  # de-duped, order-preserving


def build_validated_sources(chunks: List[RetrievedChunk], cited_ids: List[str]) -> List[Source]:
    """Return Source objects only for chunks that were both retrieved AND
    cited by the LLM. If the LLM cited nothing (or an unconfigured LLM path
    was used), fall back to the top retrieved chunks so the user still sees
    grounding evidence."""
    by_doc_id = {c.document_id: c for c in chunks}

    valid_ids = [cid for cid in cited_ids if cid in by_doc_id]
    if not valid_ids:
        # fallback: surface the strongest retrieved evidence anyway
        valid_ids = [c.document_id for c in chunks[:3]]

    sources: List[Source] = []
    seen = set()
    for doc_id in valid_ids:
        chunk = by_doc_id.get(doc_id)
        if not chunk or doc_id in seen:
            continue
        seen.add(doc_id)
        status = (
            SourceStatus.verified if chunk.is_authoritative and chunk.status == "verified"
            else SourceStatus.international if chunk.jurisdiction == "international"
            else SourceStatus.review
        )
        sources.append(
            Source(
                id=chunk.document_id,
                title=chunk.title,
                subTitle=chunk.sub_title or None,
                jurisdiction=Jurisdiction(chunk.jurisdiction),
                documentType=chunk.document_type,
                authority=chunk.authority,
                lastUpdated=chunk.section or "—",  # populated properly from metadata in real corpus
                status=status,
                url=chunk.source_url or "#",
                isMock=not chunk.is_authoritative,
                sourceType=chunk.source_type,
                isAuthoritative=chunk.is_authoritative,
                relevanceScore=round(chunk.final_score, 3),
                snippet=(chunk.text[:220] + "…") if len(chunk.text) > 220 else chunk.text,
            )
        )
    return sources


def strip_uncited_bracket_ids(llm_text: str, valid_ids: List[str]) -> str:
    """Remove any [id]-style citation markers that don't correspond to a
    validated source, so the visible text never references a phantom
    citation."""
    def _replace(match: re.Match) -> str:
        return match.group(0) if match.group(1) in valid_ids else ""

    return CITATION_PATTERN.sub(_replace, llm_text)
