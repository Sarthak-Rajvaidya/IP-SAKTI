"""
Query routing: language detection, intent classification and multi-domain
routing. This is intentionally rule/keyword based rather than another LLM
call — it needs to be fast, deterministic and cheap, and it feeds directly
into retrieval filtering (which jurisdiction/domain metadata to prefer).

A query can legitimately route to multiple domains at once (e.g. a
patentability question about a named herb routes to PATENT +
TRADITIONAL_KNOWLEDGE + ABS + AYUSH_REGULATORY), matching the project spec.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "PATENT": ["patent", "patentab", "novelty", "inventive step", "prior art", "claim"],
    "TRADEMARK": ["trademark", "trade mark", "brand name", "logo", "mark registration"],
    "GI": ["geographical indication", " gi ", "gi registration", "regional origin"],
    "COPYRIGHT": ["copyright", "literary work", "artistic work"],
    "DESIGN": ["design registration", "product shape", "bottle design", "packaging design"],
    "TRADE_SECRET": ["trade secret", "confidential formula", "nda", "know-how"],
    "PLANT_VARIETY": ["plant variety", "cultivar", "farmers rights", "ppv"],
    "TRADITIONAL_KNOWLEDGE": ["traditional knowledge", "classical text", "tkdl", "prior art in ayurveda", "ancient formulation"],
    "ABS_BIODIVERSITY": ["abs", "access and benefit", "biodiversity", "biological resource", "nagoya", "benefit sharing"],
    "AYUSH_REGULATORY": ["ayush", "ayurvedic medicine license", "drug license", "classical medicine", "proprietary medicine"],
    "FOOD_NUTRACEUTICAL": ["food", "nutraceutical", "supplement", "fssai", "ayurveda aahar"],
    "COSMETIC": ["cosmetic", "skincare", "personal care"],
    "ADVERTISING": ["advertising", "advertisement", "claim on label", "marketing claim"],
    "EXPORT_INTERNATIONAL": ["export", "international market", "eu market", "us market", "overseas", "foreign filing"],
}

INTENT_KEYWORDS: dict[str, list[str]] = {
    "patentability": ["patent", "patentable", "novelty", "inventive"],
    "traditional_knowledge_check": ["traditional knowledge", "classical", "tkdl", "prior art"],
    "abs_compliance": ["abs", "biodiversity", "biological resource", "benefit sharing"],
    "branding": ["trademark", "brand", "logo", "name protection"],
    "export_compliance": ["export", "eu", "international", "overseas", "abroad"],
    "classification": ["classify", "classification", "what category", "which category"],
    "general_guidance": [],
}


@dataclass
class RoutingResult:
    detected_language: str
    intent: str
    domains: List[str] = field(default_factory=list)


def detect_language(text: str) -> str:
    try:
        from langdetect import detect, DetectorFactory

        DetectorFactory.seed = 0
        code = detect(text)
        # collapse langdetect's broader set to our 3 supported UI languages,
        # defaulting to English for anything else (the LLM will still see the
        # original text either way).
        if code in ("hi",):
            return "hi"
        if code in ("mr",):
            return "mr"
        return "en"
    except Exception:  # noqa: BLE001 - langdetect fails on very short/ambiguous strings
        return "en"


def classify_intent(query: str) -> str:
    q = query.lower()
    best_intent = "general_guidance"
    best_hits = 0
    for intent, keywords in INTENT_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in q)
        if hits > best_hits:
            best_hits = hits
            best_intent = intent
    return best_intent


def route_domains(query: str, product_context_text: str = "") -> List[str]:
    q = f"{query} {product_context_text}".lower()
    matched: List[str] = []
    for domain, keywords in DOMAIN_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            matched.append(domain)

    # Sensible defaults so a bare "can I patent X" style query still routes
    # to the cluster the project spec calls out explicitly.
    if "PATENT" in matched:
        for extra in ("TRADITIONAL_KNOWLEDGE", "ABS_BIODIVERSITY", "AYUSH_REGULATORY"):
            if extra not in matched:
                matched.append(extra)

    if not matched:
        matched.append("AYUSH_REGULATORY")

    return matched


def route_query(query: str, product_context_text: str = "") -> RoutingResult:
    return RoutingResult(
        detected_language=detect_language(query),
        intent=classify_intent(query),
        domains=route_domains(query, product_context_text),
    )
