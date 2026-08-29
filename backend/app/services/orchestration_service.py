"""
Orchestration layer.

This is a lightweight, DETERMINISTIC router over reasoning modules, not an
autonomous agentic system. It exists so the architecture is ready for real
agentic orchestration later (see README "Future agentic architecture")
without overclaiming what's implemented today: each "module" here just
maps a routed domain to a label used for transparency
(`reasoningModulesUsed` in the API response) and to bias retrieval/prompt
framing. There is no independent planning, tool use, or multi-step agent
loop — Gemini is called once per request with assembled context.
"""
from __future__ import annotations

from typing import List

MODULE_MAP: dict[str, str] = {
    "PATENT": "patent_reasoning_module",
    "TRADEMARK": "patent_reasoning_module",
    "GI": "patent_reasoning_module",
    "COPYRIGHT": "patent_reasoning_module",
    "DESIGN": "patent_reasoning_module",
    "TRADE_SECRET": "patent_reasoning_module",
    "PLANT_VARIETY": "patent_reasoning_module",
    "TRADITIONAL_KNOWLEDGE": "patent_reasoning_module",
    "ABS_BIODIVERSITY": "abs_reasoning_module",
    "AYUSH_REGULATORY": "regulatory_reasoning_module",
    "FOOD_NUTRACEUTICAL": "regulatory_reasoning_module",
    "COSMETIC": "regulatory_reasoning_module",
    "ADVERTISING": "regulatory_reasoning_module",
    "EXPORT_INTERNATIONAL": "international_ip_reasoning_module",
}


def modules_for_domains(domains: List[str]) -> List[str]:
    modules = []
    for d in domains:
        m = MODULE_MAP.get(d)
        if m and m not in modules:
            modules.append(m)
    return modules or ["regulatory_reasoning_module"]
