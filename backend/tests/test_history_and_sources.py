from __future__ import annotations


def test_escalation_creates_ticket_with_pending_status(client):
    resp = client.post(
        "/api/escalate",
        json={
            "query": "Is my formulation patentable?",
            "areaOfConcern": "Patentability",
            "jurisdiction": "India",
            "contactPreference": "Email",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["ticketId"].startswith("ESC-")
    assert body["status"] == "pending-review"


def test_history_reflects_assistant_queries(client, mocker):
    from app.services.retrieval_service import RetrievedChunk

    chunk = RetrievedChunk(
        document_id="in-patents-act-3p", chunk_id="c1", title="Patents Act",
        sub_title="", authority="IP Office", jurisdiction="india", document_type="Statute",
        source_url="#", section="Section 3(p)", topic="patentability", ip_category="PATENT",
        language="en", is_authoritative=False, source_type="demo", status="review",
        text="demo text", semantic_score=0.85, final_score=0.85,
    )
    mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search.return_value = [chunk]
    mocker.patch("app.services.rag_service.get_llm_service").return_value.generate.return_value = (
        "Grounded answer [in-patents-act-3p]."
    )

    client.post("/api/assistant/ask", json={"query": "Can I patent my formulation?", "jurisdiction": "india"})

    resp = client.get("/api/history")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 1
    assert items[0]["query"] == "Can I patent my formulation?"
    assert items[0]["jurisdiction"] == "india"


def test_knowledge_graph_returns_frontend_compatible_shape(client):
    resp = client.get("/api/knowledge-graph")
    assert resp.status_code == 200
    body = resp.json()
    assert "nodes" in body and "edges" in body
    assert all({"id", "label", "category", "description"} <= set(n.keys()) for n in body["nodes"])
    assert all({"from", "to", "relation"} <= set(e.keys()) for e in body["edges"])


def test_sources_endpoint_separates_india_and_international(client):
    resp = client.get("/api/sources")
    assert resp.status_code == 200
    body = resp.json()
    assert all(s["jurisdiction"] == "india" for s in body["india"])
    assert all(s["jurisdiction"] == "international" for s in body["international"])
    assert len(body["india"]) > 0
    assert len(body["international"]) > 0
