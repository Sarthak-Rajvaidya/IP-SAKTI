"""
Product classification service.

Rule-based over the 6-step wizard answers the frontend already collects
(see frontend `wizardSteps`). This is deliberately transparent rather than
an LLM call: the classification result feeds directly into retrieval
routing, so it needs to be deterministic and explainable ("reasoning" /
"uncertainty flags" are returned for exactly that purpose).
"""
from __future__ import annotations

from typing import List

from app.schemas.classification import ClassificationAnswer, ClassificationResult

CATEGORIES = {
    "classical": "Classical Ayurvedic Medicine",
    "proprietary": "Proprietary / Patent-or-Proprietary Ayurvedic Medicine",
    "new_drug": "New / Non-Classical Drug",
    "phytopharmaceutical": "Phytopharmaceutical",
    "food": "Ayurveda-Aahar / Food / Nutraceutical",
    "cosmetic": "Cosmetic",
}


def _answer_for(answers: List[ClassificationAnswer], step: int) -> str:
    for a in answers:
        if a.step == step:
            return (a.answer or "").lower()
    return ""


def classify_product(answers: List[ClassificationAnswer]) -> ClassificationResult:
    if not answers:
        return ClassificationResult(
            label="Insufficient Information",
            confidence=20,
            reasons=["No classification answers were provided."],
            nextSteps=["Complete the classification wizard to get a grounded result."],
            category=None,
            uncertaintyFlags=["no_answers_provided"],
        )

    product_type = _answer_for(answers, 1)
    derived_from_classical = _answer_for(answers, 2)
    modified = _answer_for(answers, 3)
    intended_use = _answer_for(answers, 4)
    target_market = _answer_for(answers, 5)
    has_bio_resource = _answer_for(answers, 6)

    reasons: List[str] = []
    uncertainty: List[str] = []
    confidence = 55

    # Cosmetic / food branch first — intended use is the strongest signal.
    if "cosmetic" in intended_use or "cosmetic" in product_type:
        category = "cosmetic"
        reasons.append("Intended use is cosmetic / personal care")
        confidence = 75
    elif "food" in intended_use or "nutrit" in intended_use or "supplement" in product_type:
        category = "food"
        reasons.append("Intended use is nutritional / food-adjacent")
        confidence = 72
    elif "yes" in derived_from_classical and ("no modification" in modified or "no," in modified or modified.startswith("no")):
        category = "classical"
        reasons.append("Formulation closely follows a documented classical reference")
        reasons.append("No or minimal proprietary modification identified")
        confidence = 78
    elif "significantly modified" in modified or ("no" in derived_from_classical and "new" in derived_from_classical) or derived_from_classical.startswith("no"):
        category = "proprietary" if "yes" in derived_from_classical or "partially" in derived_from_classical else "new_drug"
        reasons.append("Formulation differs materially from any classical reference")
        reasons.append("Likely intended for therapeutic use" if "therap" in intended_use or "medicine" in intended_use else "Use case suggests a non-classical product")
        confidence = 74
    elif "minor modifications" in modified or "partially" in derived_from_classical:
        category = "proprietary"
        reasons.append("Formulation is partially inspired by a classical reference with modification")
        confidence = 62
    else:
        category = "proprietary"
        reasons.append("Insufficient signal to confirm classical status — defaulting to proprietary pending review")
        uncertainty.append("classical_status_unclear")
        confidence = 45

    if "yes" in has_bio_resource:
        reasons.append("Contains biological resources — ABS review is relevant")
    elif "unsure" in has_bio_resource:
        uncertainty.append("biological_resource_unclear")
        reasons.append("Biological-resource sourcing is unclear — confirm before proceeding")

    if "international" in target_market:
        reasons.append("International target market — export-compliance pathway applies")

    next_steps = _next_steps_for(category, has_bio_resource, target_market)

    return ClassificationResult(
        label=CATEGORIES[category],
        confidence=confidence,
        reasons=reasons,
        nextSteps=next_steps,
        category=category,
        uncertaintyFlags=uncertainty,
    )


def _next_steps_for(category: str, has_bio_resource: str, target_market: str) -> List[str]:
    steps: List[str] = []
    if category == "classical":
        steps += [
            "Confirm classification with AYUSH licensing guidance",
            "Patent protection is unlikely to apply to the base formulation",
            "Consider trademark protection for your specific brand",
        ]
    elif category in ("proprietary", "new_drug", "phytopharmaceutical"):
        steps += [
            "Review applicable AYUSH licensing requirements",
            "Evaluate patentability of the modified formulation",
            "Run a Traditional Knowledge (TKDL) prior-art check",
        ]
    elif category == "food":
        steps += [
            "Review FSSAI guidance for Ayurveda-adjacent food products",
            "Confirm labelling and health-claim compliance",
        ]
    elif category == "cosmetic":
        steps += [
            "Review cosmetic-specific AYUSH / BIS requirements",
            "Evaluate design protection for packaging and applicator",
        ]

    if "yes" in has_bio_resource:
        steps.append("Assess ABS obligations for source ingredients")
    if "international" in target_market:
        steps.append("Review export-market regulatory and IP filing pathway")
    steps.append("Review trademark strategy for the product name")
    return steps
