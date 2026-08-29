from __future__ import annotations


def test_abs_assessment_commercial_intent_recommends_review(client, mocker):
    mocker.patch(
        "app.services.abs_service.get_retrieval_service"
    ).return_value.search.return_value = []

    resp = client.post(
        "/api/abs/assess",
        json={
            "resource": "Ashwagandha",
            "origin": "India",
            "commercialIntent": True,
            "entityType": "Startup",
            "useType": "Commercial",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "review-recommended"
    assert len(body["nextSteps"]) > 0


def test_abs_assessment_non_commercial_likely_exempt(client, mocker):
    mocker.patch(
        "app.services.abs_service.get_retrieval_service"
    ).return_value.search.return_value = []

    resp = client.post(
        "/api/abs/assess",
        json={
            "resource": "Ashwagandha",
            "origin": "India",
            "commercialIntent": False,
            "entityType": "Academic / Research Institution",
            "useType": "Research",
        },
    )
    body = resp.json()
    assert body["status"] == "likely-exempt"


def test_abs_assessment_grounds_in_retrieved_sources_when_available(client, mocker):
    from app.services.retrieval_service import RetrievedChunk

    chunk = RetrievedChunk(
        document_id="in-bd-act", chunk_id="c1", title="Biological Diversity Act",
        sub_title="", authority="NBA", jurisdiction="india", document_type="Statute",
        source_url="#", section="", topic="ABS", ip_category="ABS_BIODIVERSITY",
        language="en", is_authoritative=False, source_type="demo", status="review",
        text="ABS explanatory text", semantic_score=0.8, final_score=0.8,
    )
    mocker.patch(
        "app.services.abs_service.get_retrieval_service"
    ).return_value.search.return_value = [chunk]

    resp = client.post(
        "/api/abs/assess",
        json={"resource": "Ashwagandha", "origin": "India", "commercialIntent": True, "entityType": "Startup", "useType": "Commercial"},
    )
    body = resp.json()
    assert any(s["id"] == "in-bd-act" for s in body["sources"])
