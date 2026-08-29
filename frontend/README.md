# IP-SAKTI — Frontend

> Protecting Ayurveda's Knowledge. Powering Ayurveda's Innovation.

This is the frontend half of the IP-SAKTI project — see the **root `README.md`** (one level up)
for full project architecture, setup for both frontend and backend, and how to run the complete
demo.

This app now talks to a **real FastAPI backend** (see `../backend/`). `src/data/mockApi.ts` — kept
under its original name for continuity — calls the backend's REST API rather than returning mock
data.

## Getting started

```bash
npm install
cp .env.example .env   # sets VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Make sure the backend (`../backend/`) is running first — see the root README for full setup
(Gemini API key, Qdrant, corpus ingestion). If the backend isn't reachable, pages show an inline
error banner with a retry button instead of crashing.

To build a production bundle:

```bash
npm run build
npm run preview
```

## What's inside

- **Dashboard** — hero, capability cards, AI reasoning pipeline visualization, planned agent
  orchestration layer, and a Trust & Safety section.
- **Ask IP-SAKTI** — the core AI workspace: India/International jurisdiction toggle, a product
  context panel, a chat experience with suggested prompts, a mock voice-input placeholder, and
  rich AI Analysis responses (now real: source-cited, confidence-scored, jurisdiction-grounded)
  with a "Why am I seeing this answer?" explainability panel.
- **Classify** — a 6-step guided classification wizard, backed by the real rule-based classifier.
- **IP Explorer** — a visual decision system across Patent, Trademark, GI, Copyright, Design,
  Trade Secret and Plant Variety Protection.
- **ABS Advisor** — a biodiversity/Access & Benefit-Sharing assessment tool, retrieval-grounded.
- **Knowledge Explorer** — the backend's knowledge graph, rendered visually.
- **Sources & Citations** — the real ingested corpus registry, split into Indian and
  International sources.
- **Query History** and **Settings** (language switcher: English / Hindi / Marathi, Demo Mode).

### Demo Mode

Toggle **Demo Mode** in the top bar (or Settings), then open **Ask IP-SAKTI** — it preloads the
Ashwagandha patentability example end-to-end, now hitting the real backend pipeline.

## Tech stack

React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + React Router + Lucide icons.

## Connecting to the backend

All backend calls live in `src/data/mockApi.ts`. Configure the backend URL via
`VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:8000`).

## Disclaimer

IP-SAKTI provides AI-assisted informational guidance and does not constitute legal advice.
