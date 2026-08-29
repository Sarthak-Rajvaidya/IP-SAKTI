"""
scripts/healthcheck.py

Quick standalone script to check whether the IP-SAKTI backend and its
dependencies (Gemini, Qdrant, embeddings) are reachable/configured, without
needing to open the interactive docs. Useful right after `docker compose up`
or `uvicorn app.main:app` to confirm the stack is ready before a demo.

Usage:
    python scripts/healthcheck.py
    python scripts/healthcheck.py --url http://localhost:8000
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of the running backend")
    args = parser.parse_args()

    try:
        with urllib.request.urlopen(f"{args.url}/api/health", timeout=5) as resp:
            health = json.loads(resp.read())
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"❌ Could not reach {args.url}/api/health — is the backend running? ({exc})")
        return 1

    try:
        with urllib.request.urlopen(f"{args.url}/api/config", timeout=5) as resp:
            config = json.loads(resp.read())
    except (urllib.error.URLError, TimeoutError):
        config = {}

    print(f"Backend reachable at {args.url}")
    print(f"  Overall status:   {health.get('status')}")
    print(f"  Gemini:           {health.get('gemini')}")
    print(f"  Qdrant:           {health.get('qdrant')}")
    print(f"  Embeddings:       {health.get('embeddings')}")
    if health.get("collection"):
        print(f"  Collection:       {health.get('collection')} ({health.get('vectorCount')} vectors)")
    if config:
        print(f"  Gemini model:     {config.get('geminiModel')}")
        print(f"  Embedding model:  {config.get('embeddingModel')}")

    if health.get("status") != "ok":
        print("\n⚠️  Backend is running but DEGRADED — see the messages above for what to fix "
              "(usually: set GEMINI_API_KEY in backend/.env, start Qdrant, or install/download the embedding model).")
        return 2

    print("\n✅ All dependencies configured and reachable.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
