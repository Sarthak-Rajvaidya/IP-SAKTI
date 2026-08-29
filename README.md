# IP-SAKTI — Intelligent IP & Regulatory Sahayak for Ayurveda

> Protecting Ayurveda's Knowledge. Powering Ayurveda's Innovation.

A Smart India Hackathon (SIH) prototype: a multilingual, citation-grounded AI decision-support
assistant for Ayurveda Intellectual Property, Traditional Knowledge, Access & Benefit Sharing
(ABS), biodiversity and regulatory guidance — built with a real Retrieval-Augmented Generation
(RAG) pipeline, not a plain chatbot wrapper.

This repository contains **both halves of the project**:

```
ip-sakti/
├── frontend/     React + TypeScript + Vite + Tailwind UI (unchanged visually from the
│                 original prototype — now wired to the real backend)
├── backend/      FastAPI + RAG + Qdrant + local multilingual embeddings + Gemini
├── docker-compose.yml   Runs the backend + Qdrant together
└── README.md     (this file)
```

---

## 1. Architecture

```
┌─────────────┐      HTTP/JSON       ┌──────────────────────────────────────────┐
│   Frontend   │  ───────────────▶   │                FastAPI                    │
│  React/Vite  │  ◀───────────────   │                                            │
└─────────────┘                      │  ┌──────────────────────────────────────┐ │
                                      │  │           RAG Pipeline               │ │
                                      │  │  routing → retrieval → LLM →         │ │
                                      │  │  citation validation → confidence    │ │
                                      │  └──────────────────────────────────────┘ │
                                      │        │              │            │      │
                                      │        ▼              ▼            ▼      │
                                      │  ┌───────────┐  ┌───────────┐ ┌─────────┐ │
                                      │  │ Embedding │  │  Qdrant   │ │ Gemini  │ │
                                      │  │  Service  │  │  Vector   │ │  LLM    │ │
                                      │  │(local,    │  │    DB     │ │ Service │ │
                                      │  │ BGE-M3)   │  │           │ │         │ │
                                      │  └───────────┘  └───────────┘ └─────────┘ │
                                      └──────────────────────────────────────────┘
```

The frontend never talks to Gemini, Qdrant, or the embedding model directly — it only calls the
FastAPI backend over plain HTTP/JSON, exactly the same way the original mock data layer worked.
This is what "the frontend's existing `mockApi.ts` seam" means in practice: the same function
signatures, the same return shapes, but now backed by real services.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router |
| Backend framework | FastAPI (async, Pydantic v2 validation) |
| LLM | Google Gemini (`google-genai` SDK), free-tier Flash model by default |
| Embeddings | Local, multilingual — `BAAI/bge-m3` via `sentence-transformers` (with a lighter fallback model) |
| Vector database | Qdrant (self-hosted, local, free) |
| Local persistence | SQLite via SQLModel (history, escalation tickets) |
| Language detection | `langdetect` |
| Testing | pytest + pytest-mock |

Everything above is free / open-source. The only external network dependency at runtime is the
Gemini API call itself (which has a free tier).

---

## 3. Folder structure

```
backend/
├── app/
│   ├── main.py                  FastAPI app, CORS, health/config endpoints
│   ├── config.py                Environment-based settings (pydantic-settings)
│   ├── api/                     One router per feature area
│   ├── schemas/                 Pydantic request/response models (mirror the frontend types)
│   ├── services/
│   │   ├── llm_service.py           Gemini client wrapper
│   │   ├── embedding_service.py     Local multilingual embedding model (singleton)
│   │   ├── retrieval_service.py     Qdrant client + hybrid retrieval scoring
│   │   ├── rag_service.py           The full pipeline for POST /api/assistant/ask
│   │   ├── citation_service.py      Validates/strips LLM citations against retrieved evidence
│   │   ├── confidence_service.py    Computes confidence from retrieval evidence
│   │   ├── classification_service.py  Rule-based product classifier
│   │   ├── routing_service.py       Language detection, intent, domain routing
│   │   ├── knowledge_graph_service.py  In-memory JSON knowledge graph
│   │   ├── abs_service.py           ABS advisor (heuristic + retrieval-grounded)
│   │   ├── orchestration_service.py Deterministic reasoning-module router
│   │   ├── sources_service.py       Loads the generated source registry
│   │   └── persistence_service.py   SQLite-backed history/escalation storage
│   ├── prompts/                 System prompt(s) for Gemini
│   └── data/                    knowledge_graph.json, sources_registry.json (generated)
├── data/corpus/                 Demo document corpus (india/, international/, demo/)
├── scripts/
│   ├── ingest.py                 Chunk + embed + upsert corpus into Qdrant
│   └── healthcheck.py            Quick CLI check of backend + dependency status
├── tests/                        26 pytest tests
├── .env.example
├── requirements.txt
└── Dockerfile

frontend/
└── src/data/mockApi.ts          The ONLY file that calls the backend (fetch-based)
```

---

## 4. How RAG works here

```
User query
   │
   ▼
Language detection (langdetect) ──▶ detected_language
   │
   ▼
Intent classification (keyword-based) ──▶ e.g. "patentability"
   │
   ▼
Domain routing ──▶ e.g. [PATENT, TRADITIONAL_KNOWLEDGE, ABS_BIODIVERSITY, AYUSH_REGULATORY]
   │
   ▼
Multilingual embedding of the query (BAAI/bge-m3)
   │
   ▼
Qdrant vector search, filtered strictly by jurisdiction (india | international)
   │
   ▼
Hybrid re-ranking: 0.55×semantic + 0.15×keyword-overlap + 0.15×authority
                    + 0.10×jurisdiction-match + 0.05×domain-match
   │
   ▼
Safe-abstention gate: is the top relevance ≥ RAG_MIN_RELEVANCE?
   │                                              │
   │ No                                           │ Yes
   ▼                                              ▼
Abstain (no LLM call)                    Assemble evidence context, call Gemini
   │                                              │
   │                                              ▼
   │                                     Gemini answers ONLY from the given
   │                                     evidence, citing [document_id] markers
   │                                              │
   │                                              ▼
   │                                     Citation validator: strip any
   │                                     [document_id] not actually retrieved
   │                                              │
   │                                              ▼
   │                                     Confidence computed from retrieval
   │                                     evidence (NOT asked from the LLM)
   │                                              │
   └──────────────────────┬───────────────────────┘
                           ▼
                  AssistantResponse returned to frontend
```

**Why this matters for the demo:** the LLM is never allowed to answer from its own training
knowledge alone. It only ever sees the specific retrieved chunks for the request's jurisdiction,
and any citation it produces that doesn't match a retrieved chunk is deleted before the response
leaves the server.

---

## 5. How embeddings work

`app/services/embedding_service.py` loads a `sentence-transformers` model **once** (a
process-wide singleton) and reuses it for every request — it does not reload the model per
request. It tries `BAAI/bge-m3` first (best multilingual quality, ~2.2GB); if that fails to load
(e.g. not enough RAM, or no internet to download it), it automatically falls back to the much
lighter `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. If both fail, the app
doesn't crash — `/api/health` reports `embeddings: unavailable: <reason>` and
`/api/assistant/ask` returns a clear `503` instead of a broken or fabricated answer.

## 6. How Qdrant works

Qdrant is a vector database — it stores each document chunk's embedding plus metadata
(jurisdiction, authority, IP category, etc.) and lets you search for the chunks whose embeddings
are most similar (cosine similarity) to your query's embedding. `retrieval_service.py` also
applies a **hard jurisdiction filter** at the database-query level — an "india" request literally
cannot retrieve "international" chunks, and vice versa. This is what "jurisdiction isolation" (a
core requirement) means in code, not just in the prompt.

## 7. How Gemini is used

`app/services/llm_service.py` wraps the official `google-genai` SDK. One call is made per
assistant request, with:
- a **system prompt** (`app/prompts/assistant_system.txt`) that forbids fabricating citations,
  statute text, or treaty articles, and requires jurisdiction discipline and abstention language
- a **user prompt** containing the query, product context, and only the retrieved evidence chunks

If `GEMINI_API_KEY` is missing, `llm_service.is_configured()` is `False` and the API returns a
`503` with a clear message — the app never crashes and never falls back to an ungrounded answer.

## 8. How citations work

The LLM is asked to mark claims with `[document_id]`. `citation_service.py`:
1. Extracts every `[xxx]` marker from the LLM's raw text
2. Keeps only the ones matching an actually-retrieved chunk's `document_id`
3. Builds the `sources` list in the API response **only** from those validated IDs
4. Strips any non-matching bracket marker from the visible answer text

This means a citation appearing in the UI is always traceable to something that was actually
retrieved for that specific request — never invented by the model.

## 9. How confidence works

`confidence_service.py` computes a 0–100 score from:
- average relevance of the retrieved chunks (`final_score`, itself a hybrid of semantic +
  keyword + authority + jurisdiction + domain signals)
- agreement/spread across the top sources (tightly-clustered scores → small bonus)
- proportion of authoritative (non-demo) sources
- a small bonus for more corroborating sources, capped

The LLM is **never asked** for this number.

## 10. How safe abstention works

Before calling Gemini at all, the pipeline filters retrieved chunks to those scoring at or above
`RAG_MIN_RELEVANCE`. If none qualify, the backend returns a safe, honest message
("I could not retrieve enough authoritative material to answer this reliably...") with
`abstained: true`, whatever weak sources were found, and a low confidence score — **without
spending an LLM call or risking a fabricated answer**.

## 11. How multilingual retrieval works

`BAAI/bge-m3` is multilingual, so a Hindi or Marathi query embeds into the same vector space as
the (currently English) demo corpus — cross-language retrieval works without translating the
query first. `routing_service.py` detects the query's language via `langdetect` and passes it
through untouched to Gemini, which is asked to respond in that language while still citing the
(English-authored) evidence. The original query and detected language are both preserved and
returned in the API response (`detectedLanguage`).

---

## 12. Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker (optional, for the easiest Qdrant setup)

### Clone / unzip, then:

```bash
# 1. Frontend deps
cd frontend
npm install

# 2. Backend deps
cd ../backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 13. How to create a Gemini API key

1. Go to <https://aistudio.google.com/apikey>
2. Sign in with a Google account
3. Click **Create API key** (choose "Create key in new project" if you don't have one)
4. Copy the key — you'll paste it into `backend/.env` in the next step

Gemini's free tier is enough for hackathon demo purposes. If you hit a rate limit, wait a minute
or switch `GEMINI_MODEL` to a different available Flash variant.

---

## 14. How to configure `.env`

```bash
cd backend
cp .env.example .env
```

Open `.env` and at minimum set:

```
GEMINI_API_KEY=your-key-here
```

Everything else has a sensible default for local development. See `.env.example` for the full
list (embedding model, Qdrant URL, RAG thresholds, CORS origin, etc.).

---

## 15. How to start Qdrant

**Option A — Docker (recommended):**
```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:v1.12.4
```

**Option B — full stack via docker-compose** (from the repo root, starts Qdrant + backend together):
```bash
docker compose up --build
```

Qdrant will be reachable at `http://localhost:6333` either way (matches the `.env.example`
default).

---

## 16. How to ingest documents

The repo ships with a small, honestly-labelled **demo corpus** (see §21). To (re)build the
Qdrant collection from it:

```bash
cd backend
python scripts/ingest.py
```

This will:
- parse every `.md` / `.txt` / `.pdf` file under `backend/data/corpus/{india,international,demo}/`
- chunk each document, embed each chunk (loads the embedding model — the first run downloads it,
  which needs internet access)
- upsert the vectors + metadata into your running Qdrant instance
- skip documents that haven't changed since the last run (content-hash cache)
- regenerate `app/data/sources_registry.json`, which powers `GET /api/sources`

To add your **own, official** legal source documents: drop `.md`/`.txt`/`.pdf` files into the
matching `india/` or `international/` folder (see §21 for the required frontmatter format), then
re-run `python scripts/ingest.py`.

Useful flags:
```bash
python scripts/ingest.py --metadata-only   # rebuild sources_registry.json only, no embedding model / Qdrant needed
python scripts/ingest.py --force           # re-embed everything, ignoring the change-cache
```

---

## 17. How to start FastAPI

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Visit <http://localhost:8000/docs> for interactive Swagger docs, or run:
```bash
python scripts/healthcheck.py
```
to get a quick pass/fail summary of Gemini / Qdrant / embeddings status.

---

## 18. How to connect the frontend

```bash
cd frontend
cp .env.example .env   # sets VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Open the printed local URL. The frontend now calls the real backend for every page — if the
backend isn't running, you'll see an inline "Couldn't reach IP-SAKTI backend" banner with a retry
button rather than a crash.

---

## 19. Demo commands (full flagship flow)

```bash
# Terminal 1
docker run -p 6333:6333 qdrant/qdrant:v1.12.4

# Terminal 2
cd backend
source venv/bin/activate
python scripts/ingest.py          # first time only (or after changing the corpus)
uvicorn app.main:app --reload --port 8000

# Terminal 3
cd frontend
npm run dev
```

Then open the frontend, go to **Ask IP-SAKTI**, select **India**, and ask:

> Can I patent my Ashwagandha formulation?

Or just flip on **Demo Mode** in the top bar first — it preloads this exact scenario end to end.

You can also drive it directly against the API:
```bash
curl -X POST http://localhost:8000/api/assistant/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Can I patent my Ashwagandha formulation?", "jurisdiction": "india"}'
```

---

## 20. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `/api/assistant/ask` returns 503 "Configuration error" | `GEMINI_API_KEY` missing/blank | Set it in `backend/.env`, restart uvicorn |
| `/api/assistant/ask` returns 503 "Qdrant unavailable" | Qdrant isn't running | `docker run -p 6333:6333 qdrant/qdrant` |
| `/api/assistant/ask` returns 503 "Embeddings unavailable" | `sentence-transformers` not installed, or model couldn't download | `pip install -r requirements.txt`; ensure internet access for the first model download |
| Frontend shows "Couldn't reach IP-SAKTI backend" | FastAPI isn't running, or wrong `VITE_API_BASE_URL` | Start uvicorn; check `frontend/.env` |
| CORS error in browser console | Frontend origin not in `CORS_ORIGINS` | Add it to `backend/.env`, restart uvicorn |
| `ingest.py` seems to do nothing | All documents unchanged since last run | Use `--force` to re-embed anyway |
| Answers always abstain | Corpus not ingested yet, or `RAG_MIN_RELEVANCE` too high | Run `python scripts/ingest.py`; lower the threshold in `.env` for testing |
| Everything is slow on first request | Embedding model is downloading/loading (one-time) | Wait for the first request to complete; subsequent ones reuse the cached model |

---

## 21. About the demo corpus (read this before a judge asks)

Every file in `backend/data/corpus/` is a **project-authored explanatory reference**, not an
ingestion of official statute or treaty text. Each has `is_authoritative: false` and
`source_type: demo` in its YAML frontmatter, and the frontend visually distinguishes these
(review/international badges rather than "verified"). This is deliberate — the project does not
fabricate fake legal quotations to make the RAG pipeline look more impressive; it builds genuinely
correct retrieval/citation/confidence behaviour over honestly-labelled material.

To build a production-accurate corpus, add official PDFs/text into the same
`backend/data/corpus/{india,international}/` folders (see the existing `.md` files for the
required frontmatter fields: `document_id`, `title`, `jurisdiction`, `authority`, `source_url`,
`ip_category`, `is_authoritative: true`, `source_type: "authoritative"`, etc.), then re-run
`python scripts/ingest.py`.

---

## 22. Future Neo4j integration

`knowledge_graph_service.py` currently reads a static `app/data/knowledge_graph.json` file into
memory. It's already expressed behind a small interface (`get_graph()`, `neighbors()`) so a real
graph database can replace the storage layer later:
1. Stand up Neo4j (Docker: `neo4j:5`)
2. Implement the same two methods using the `neo4j` Python driver (Cypher queries) instead of
   JSON parsing
3. `GET /api/knowledge-graph`'s contract doesn't need to change — the frontend Knowledge Explorer
   keeps working unmodified

## 23. Future PostgreSQL integration

The project currently uses SQLite (via SQLModel) for history and escalation tickets — see
`app/services/persistence_service.py`. It's intentionally a small repository-style interface
(`add_history_item`, `list_history`, `add_escalation`) so PostgreSQL can be swapped in later by
changing only the `create_engine(...)` connection string and adding a migration tool (Alembic).
Planned additions once PostgreSQL is introduced:
- **users** — authentication, roles (practitioner / startup / admin)
- **history** — richer per-user query history (currently global/anonymous)
- **audit logs** — who asked what, when, and what was retrieved/answered
- **escalations** — full lifecycle tracking (assigned expert, resolution, SLA)
- **feedback** — thumbs up/down on answers, for future fine-tuning/eval
- **source versioning** — track when a legal source's text changed and re-flag affected answers

## 24. Future agentic architecture

`orchestration_service.py` currently implements a **deterministic router**, not autonomous
agents: it maps routed domains (PATENT, ABS_BIODIVERSITY, etc.) to a fixed set of "reasoning
module" labels, which are surfaced in the API response as `reasoningModulesUsed` for
transparency. There is no independent planning, multi-step tool use, or agent loop — Gemini is
called exactly once per request with pre-assembled context. A future version could give each
module (Patent, ABS, Regulatory, International IP) its own retrieval scope, its own LLM call, and
a coordinating planner that decides which modules to invoke and how to merge their outputs — this
is the natural next step once the deterministic version has been validated.

---

## 25. How to explain this to SIH judges (concise version)

> "IP-SAKTI classifies the user's Ayurveda product, detects the query's language and legal
> domain, then retrieves only the authoritative documents relevant to that domain **and** the
> chosen jurisdiction from a vector database — never mixing India and international law. Those
> retrieved documents, and only those documents, are given to Gemini, which must cite them by ID
> to make any legal claim. Our backend then double-checks every citation the model produces
> against what was actually retrieved and deletes anything it can't verify — so the system can
> never present a fabricated law or treaty article as real. Confidence isn't something we ask the
> AI for; we calculate it ourselves from how relevant, how many, and how authoritative the
> retrieved sources actually were. And if we don't have enough evidence to answer responsibly, the
> system says so and offers to escalate to a human expert, instead of guessing."

---

## Testing

```bash
cd backend
pytest -v
```

26 tests cover: health/config reporting, missing-Gemini-key handling, Qdrant-unavailable
handling, embeddings-unavailable handling, invalid requests, India queries, International
queries, jurisdiction separation, multilingual detection, safe abstention (asserting the LLM is
**not called** when evidence is irrelevant), citation validation (fabricated citations stripped,
real ones preserved), confidence-depends-on-evidence (not the LLM), the flagship Ashwagandha demo
flow, product classification rules, ABS assessment, history, and the sources registry.

---

## Disclaimer

IP-SAKTI provides AI-assisted informational guidance and does not constitute legal advice. Always
verify critical IP/regulatory decisions with a qualified professional.
