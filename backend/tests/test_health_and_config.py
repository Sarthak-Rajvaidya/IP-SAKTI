from __future__ import annotations


def test_health_endpoint_returns_200_even_when_nothing_configured(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    from app.config import get_settings

    get_settings.cache_clear()

    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] in ("ok", "degraded")
    assert "gemini" in body and "qdrant" in body and "embeddings" in body


def test_config_endpoint_reports_gemini_not_configured(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    from app.config import get_settings

    get_settings.cache_clear()

    resp = client.get("/api/config")
    assert resp.status_code == 200
    assert resp.json()["geminiConfigured"] is False


def test_assistant_ask_missing_gemini_key_returns_clear_config_error(client, monkeypatch, mocker):
    """Even if retrieval succeeds, a missing Gemini key must surface as a
    clear 503 configuration error — never a silent fabricated answer."""
    monkeypatch.setenv("GEMINI_API_KEY", "")
    from app.config import get_settings

    get_settings.cache_clear()

    fake_chunk = mocker.Mock(
        document_id="in-patents-act-3p", final_score=0.9, is_authoritative=False,
        jurisdiction="india", title="Patents Act", section="Section 3(p)",
        sub_title="", authority="IP Office", document_type="Statute",
        source_url="#", text="demo text", status="review", source_type="demo",
    )
    mocker.patch(
        "app.services.rag_service.get_retrieval_service"
    ).return_value.search.return_value = [fake_chunk]

    resp = client.post(
        "/api/assistant/ask",
        json={"query": "Can I patent my Ashwagandha formulation?", "jurisdiction": "india"},
    )
    assert resp.status_code == 503
    assert "Configuration error" in resp.json()["detail"]


def test_assistant_ask_qdrant_unavailable_returns_clear_error(client, mocker):
    from app.services.retrieval_service import QdrantUnavailableError

    mocker.patch(
        "app.services.rag_service.get_retrieval_service"
    ).return_value.search.side_effect = QdrantUnavailableError("connection refused")

    resp = client.post(
        "/api/assistant/ask",
        json={"query": "Can I patent my Ashwagandha formulation?", "jurisdiction": "india"},
    )
    assert resp.status_code == 503
    assert "Qdrant" in resp.json()["detail"]


def test_assistant_ask_embeddings_unavailable_returns_clear_error(client, mocker):
    mocker.patch(
        "app.services.rag_service.get_retrieval_service"
    ).return_value.search.side_effect = RuntimeError("Embeddings unavailable: no module")

    resp = client.post(
        "/api/assistant/ask",
        json={"query": "Can I patent my Ashwagandha formulation?", "jurisdiction": "india"},
    )
    assert resp.status_code == 503
    assert "RAG service error" in resp.json()["detail"]


def test_invalid_request_body_returns_422(client):
    resp = client.post("/api/assistant/ask", json={"jurisdiction": "india"})  # missing required 'query'
    assert resp.status_code == 422


def test_invalid_jurisdiction_value_returns_422(client):
    resp = client.post(
        "/api/assistant/ask", json={"query": "hello", "jurisdiction": "mars"}
    )
    assert resp.status_code == 422
