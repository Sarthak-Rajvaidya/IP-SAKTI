"""
scripts/ingest.py

Parses every .md / .txt (and .pdf, if present) document under
`backend/data/corpus/{india,international,demo}/`, chunks it, embeds each
chunk with the configured multilingual embedding model, and upserts the
vectors + metadata into Qdrant. Also regenerates
`app/data/sources_registry.json` (one entry per document, used by
`GET /api/sources`) so the Sources & Citations page reflects the actual
corpus rather than hand-maintained mock data.

Re-running this script is safe and cheap: each document's content hash is
cached in `backend/data/.ingest_cache.json`, so unchanged documents are
skipped rather than re-embedded.

Usage:
    python scripts/ingest.py                 # full ingest (embeddings + Qdrant)
    python scripts/ingest.py --metadata-only  # only rebuild sources_registry.json,
                                               # no embedding model / Qdrant required
    python scripts/ingest.py --force          # ignore the hash cache, re-embed everything
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import uuid
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

CORPUS_ROOT = BACKEND_ROOT / "data" / "corpus"
CACHE_PATH = BACKEND_ROOT / "data" / ".ingest_cache.json"
REGISTRY_PATH = BACKEND_ROOT / "app" / "data" / "sources_registry.json"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.DOTALL)

CHUNK_SIZE_CHARS = 900
CHUNK_OVERLAP_CHARS = 150


def parse_frontmatter(raw: str) -> tuple[dict[str, Any], str]:
    import yaml

    match = FRONTMATTER_RE.match(raw)
    if not match:
        raise ValueError("Document is missing YAML frontmatter (--- ... ---) block")
    meta = yaml.safe_load(match.group(1)) or {}
    body = match.group(2).strip()
    return meta, body


def chunk_text(text: str, size: int = CHUNK_SIZE_CHARS, overlap: int = CHUNK_OVERLAP_CHARS) -> list[str]:
    # paragraph-aware chunking: greedily pack paragraphs up to `size`,
    # falling back to a hard slice for any single oversized paragraph.
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current = ""
    for para in paragraphs:
        candidate = f"{current}\n\n{para}".strip() if current else para
        if len(candidate) <= size:
            current = candidate
            continue
        if current:
            chunks.append(current)
        if len(para) <= size:
            current = para
        else:
            for i in range(0, len(para), size - overlap):
                chunks.append(para[i : i + size])
            current = ""
    if current:
        chunks.append(current)
    return chunks or [text[:size]]


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_cache() -> dict[str, str]:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {}


def save_cache(cache: dict[str, str]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def read_pdf(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def iter_corpus_files():
    for jurisdiction_dir in sorted(CORPUS_ROOT.iterdir()):
        if not jurisdiction_dir.is_dir():
            continue
        for path in sorted(jurisdiction_dir.rglob("*")):
            if path.suffix.lower() in (".md", ".txt", ".pdf"):
                yield path


def frontend_status(meta: dict) -> str:
    if meta.get("status"):
        return meta["status"]
    if meta.get("jurisdiction") == "international":
        return "international"
    return "verified" if meta.get("is_authoritative") else "review"


def build_registry_entry(meta: dict) -> dict:
    return {
        "id": meta["document_id"],
        "title": meta["title"],
        "subTitle": meta.get("sub_title") or None,
        "jurisdiction": meta["jurisdiction"],
        "documentType": meta.get("document_type", "Document"),
        "authority": meta.get("authority", "Unknown"),
        "lastUpdated": str(meta.get("effective_date", "")) or "—",
        "status": frontend_status(meta),
        "url": meta.get("source_url") or "#",
        "isMock": not bool(meta.get("is_authoritative")),
        "sourceType": meta.get("source_type", "demo"),
        "isAuthoritative": bool(meta.get("is_authoritative", False)),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--metadata-only", action="store_true", help="Only rebuild sources_registry.json; skip embeddings/Qdrant")
    parser.add_argument("--force", action="store_true", help="Ignore the hash cache and re-embed everything")
    args = parser.parse_args()

    files = list(iter_corpus_files())
    if not files:
        print(f"No corpus documents found under {CORPUS_ROOT}")
        return

    cache = {} if args.force else load_cache()
    registry_entries: list[dict] = []

    embedder = None
    retrieval = None
    if not args.metadata_only:
        from app.services.embedding_service import get_embedding_service
        from app.services.retrieval_service import get_retrieval_service, QdrantUnavailableError

        embedder = get_embedding_service()
        if not embedder.is_ready():
            print(f"WARNING: embedding model unavailable ({embedder.load_error()}); "
                  f"falling back to --metadata-only behaviour for this run.")
            embedder = None
        else:
            try:
                retrieval = get_retrieval_service()
                retrieval.ensure_collection(dimension=embedder.dimension)
            except QdrantUnavailableError as exc:
                print(f"WARNING: Qdrant unavailable ({exc}); "
                      f"falling back to --metadata-only behaviour for this run.")
                retrieval = None

    total_chunks_upserted = 0
    total_docs_skipped = 0

    for path in files:
        if path.suffix.lower() == ".pdf":
            raw_text = read_pdf(path)
            meta: dict[str, Any] = {
                "document_id": path.stem,
                "title": path.stem.replace("-", " ").title(),
                "jurisdiction": path.parent.name if path.parent.name in ("india", "international") else "india",
                "document_type": "PDF Document",
                "authority": "Unknown",
                "source_url": "",
                "ip_category": "GENERAL",
                "language": "en",
                "is_authoritative": False,
                "source_type": "demo",
            }
            body = raw_text
        else:
            raw = path.read_text(encoding="utf-8")
            meta, body = parse_frontmatter(raw)
            meta.setdefault("jurisdiction", path.parent.name if path.parent.name in ("india", "international") else "india")

        if "document_id" not in meta:
            raise ValueError(f"{path}: frontmatter missing required 'document_id'")

        registry_entries.append(build_registry_entry(meta))

        doc_hash = content_hash(body)
        cache_key = str(path.relative_to(BACKEND_ROOT))
        if not args.force and cache.get(cache_key) == doc_hash:
            total_docs_skipped += 1
            continue

        if embedder is not None and retrieval is not None:
            chunks = chunk_text(body)
            vectors = embedder.embed_documents(chunks)

            from qdrant_client.models import PointStruct

            points = []
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{meta['document_id']}::{i}"))
                payload = {
                    **{k: v for k, v in meta.items() if v is not None},
                    "chunk_id": point_id,
                    "text": chunk,
                }
                points.append(PointStruct(id=point_id, vector=vector.tolist(), payload=payload))

            retrieval.upsert(points)
            total_chunks_upserted += len(points)
            print(f"Ingested {path.relative_to(CORPUS_ROOT)}: {len(points)} chunks")
        else:
            print(f"Registered metadata only for {path.relative_to(CORPUS_ROOT)} (no embed/upsert this run)")

        cache[cache_key] = doc_hash

    save_cache(cache)

    india_entries = [e for e in registry_entries if e["jurisdiction"] == "india"]
    intl_entries = [e for e in registry_entries if e["jurisdiction"] == "international"]
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    REGISTRY_PATH.write_text(
        json.dumps({"india": india_entries, "international": intl_entries}, indent=2),
        encoding="utf-8",
    )

    print("\n--- Ingest summary ---")
    print(f"Documents found:      {len(files)}")
    print(f"Documents skipped (unchanged): {total_docs_skipped}")
    print(f"Chunks upserted this run:      {total_chunks_upserted}")
    print(f"Registry written to:  {REGISTRY_PATH}")


if __name__ == "__main__":
    main()
