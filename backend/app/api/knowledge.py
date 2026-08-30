from __future__ import annotations

from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.knowledge_graph_service import get_knowledge_graph_service
from app.services.retrieval_service import get_retrieval_service


router = APIRouter(prefix="/api", tags=["knowledge"])


# ---------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------

class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    jurisdiction: str = Field(
        default="India",
        description="Jurisdiction to search within"
    )
    domains: List[str] = Field(
        default_factory=list,
        description="Optional IP domains such as PATENT, TRADEMARK, COPYRIGHT"
    )
    top_k: int = Field(
        default=8,
        ge=1,
        le=50,
        description="Number of results to return"
    )


# ---------------------------------------------------------
# Knowledge Search
# ---------------------------------------------------------

@router.post("/knowledge/search")
def knowledge_search(request: KnowledgeSearchRequest) -> dict:
    """
    Search the IP-SAKTI knowledge base using semantic retrieval,
    keyword overlap, authority weighting, jurisdiction weighting,
    and domain weighting.
    """

    retrieval = get_retrieval_service()

    # Normalize jurisdiction because Qdrant metadata is stored
    # using lowercase values such as "india" and "international".
    normalized_jurisdiction = request.jurisdiction.strip().lower()

    chunks = retrieval.search(
        query=request.query,
        jurisdiction=normalized_jurisdiction,
        domains=request.domains,
        top_k=request.top_k,
    )

    return {
        "query": request.query,
        "jurisdiction": request.jurisdiction,
        "domains": request.domains,
        "count": len(chunks),
        "results": [
            {
                "document_id": chunk.document_id,
                "chunk_id": chunk.chunk_id,
                "title": chunk.title,
                "sub_title": chunk.sub_title,
                "authority": chunk.authority,
                "jurisdiction": chunk.jurisdiction,
                "document_type": chunk.document_type,
                "source_url": chunk.source_url,
                "section": chunk.section,
                "topic": chunk.topic,
                "ip_category": chunk.ip_category,
                "language": chunk.language,
                "is_authoritative": chunk.is_authoritative,
                "source_type": chunk.source_type,
                "status": chunk.status,
                "text": chunk.text,
                "scores": {
                    "semantic": chunk.semantic_score,
                    "keyword": chunk.keyword_score,
                    "authority": chunk.authority_score,
                    "jurisdiction": chunk.jurisdiction_score,
                    "domain": chunk.domain_score,
                    "final": chunk.final_score,
                },
            }
            for chunk in chunks
        ],
    }


# ---------------------------------------------------------
# Knowledge Graph
# ---------------------------------------------------------

@router.get("/knowledge-graph")
def knowledge_graph() -> dict:
    return get_knowledge_graph_service().get_graph()