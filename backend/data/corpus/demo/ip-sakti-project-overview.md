---
document_id: demo-project-overview
title: IP-SAKTI Project Reference Corpus — Overview
sub_title: How to read this demo corpus
authority: IP-SAKTI Project (SIH prototype)
jurisdiction: india
document_type: Project Reference
source_url: ""
section: ""
article: ""
topic: project overview, RAG, citations, demo corpus
ip_category: GENERAL
language: en
effective_date: 2026-08-01
version: demo-reference-v1
is_authoritative: false
source_type: demo
status: review
---

# About this demo corpus

Every document in `backend/data/corpus/` for this SIH prototype is a
project-authored explanatory reference, not an ingestion of official legal
text. Each document is explicitly tagged `is_authoritative: false` and
`source_type: demo` in its metadata, and the frontend visually distinguishes
these from verified/authoritative sources.

This design choice is deliberate: rather than fabricating fake statute
quotations to make the RAG pipeline look more impressive, the project
generates genuinely correct retrieval, citation, and confidence-scoring
behaviour over honestly-labelled reference material. To build a
production-accurate corpus, replace or supplement these files with the
actual official PDFs/text (Acts, treaties, AYUSH circulars, etc.) placed
into the same folder structure, then re-run `python scripts/ingest.py`.
