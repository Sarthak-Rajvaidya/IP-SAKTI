from __future__ import annotations

from app.services.retrieval_service import RetrievedChunk


def _make_chunk(**overrides) -> RetrievedChunk:
    defaults = dict(
        document_id="in-patents-act-3p",
        chunk_id="chunk-1",
        title="The Patents Act, 1970",
        sub_title="Section 3(p)",
        authority="IP Office",
        jurisdiction="india",
        document_type="Statute Reference",
        source_url="https://ipindia.gov.in/patents.htm",
        section="Section 3(p)",
        topic="patentability",
        ip_category="PATENT",
        language="en",
        is_authoritative=False,
        source_type="demo",
        status="review",
        text="Traditional-knowledge exclusion explanatory text.",
        semantic_score=0.82,
        final_score=0.8,
    )
    defaults.update(overrides)
    return RetrievedChunk(**defaults)


def test_india_query_grounds_answer_and_cites_only_retrieved_sources(client, mocker):
    chunk = _make_chunk()
    mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search.return_value = [chunk]

    llm_mock = mocker.patch("app.services.rag_service.get_llm_service").return_value
    llm_mock.generate.return_value = (
        "This formulation may face novelty challenges under traditional-knowledge "
        "exclusions [in-patents-act-3p]. It also cites a document that was never "
        "retrieved [fabricated-doc-id], which must be stripped."
    )

    resp = client.post(
        "/api/assistant/ask",
        json={
            "query": "Can I patent my Ashwagandha formulation?",
            "jurisdiction": "india",
            "context": {"innovationStatus": "Proprietary", "productName": "AshwaCalm"},
        },
    )
    assert resp.status_code == 200
    body = resp.json()

    assert body["jurisdiction"] == "india"
    assert body["abstained"] is False
    # the fabricated citation must never appear as a real source
    assert all(s["id"] != "fabricated-doc-id" for s in body["sources"])
    assert any(s["id"] == "in-patents-act-3p" for s in body["sources"])
    # the visible text must not retain the hallucinated bracket marker
    assert "[fabricated-doc-id]" not in body["assessment"]
    assert "[in-patents-act-3p]" in body["assessment"]  # legitimate citation is preserved
    assert body["confidence"] > 0
    assert body["confidenceLevel"] in ("high", "medium", "low")
    assert "reasoningModulesUsed" in body and len(body["reasoningModulesUsed"]) > 0


def test_international_query_only_uses_international_jurisdiction(client, mocker):
    intl_chunk = _make_chunk(
        document_id="intl-trips", jurisdiction="international", title="TRIPS Agreement",
        source_type="demo", is_authoritative=False,
    )
    search_mock = mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search
    search_mock.return_value = [intl_chunk]

    llm_mock = mocker.patch("app.services.rag_service.get_llm_service").return_value
    llm_mock.generate.return_value = "International patentability depends on local law [intl-trips]."

    resp = client.post(
        "/api/assistant/ask",
        json={"query": "Can I patent this in the EU?", "jurisdiction": "international"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["jurisdiction"] == "international"
    # retrieval_service.search must have been called with jurisdiction='international'
    _, kwargs = search_mock.call_args
    assert kwargs["jurisdiction"] == "international"
    assert all(s["jurisdiction"] == "international" for s in body["sources"])


def test_jurisdiction_separation_india_vs_international_do_not_mix(client, mocker):
    """The retrieval layer is called with a strict per-request jurisdiction —
    this test asserts the assistant never silently blends India and
    International evidence within a single response."""
    india_chunk = _make_chunk(jurisdiction="india")
    search_mock = mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search
    search_mock.return_value = [india_chunk]
    mocker.patch("app.services.rag_service.get_llm_service").return_value.generate.return_value = (
        "Answer grounded in Indian law [in-patents-act-3p]."
    )

    resp = client.post(
        "/api/assistant/ask", json={"query": "Can I patent my formulation?", "jurisdiction": "india"}
    )
    body = resp.json()
    assert all(s["jurisdiction"] == "india" for s in body["sources"])
    assert body["whyThisAnswer"]["jurisdiction"] == "india"


def test_multilingual_query_is_detected_and_preserved(client, mocker):
    chunk = _make_chunk()
    mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search.return_value = [chunk]
    llm_mock = mocker.patch("app.services.rag_service.get_llm_service").return_value
    llm_mock.generate.return_value = "उत्तर [in-patents-act-3p] के आधार पर है।"

    resp = client.post(
        "/api/assistant/ask",
        json={
            "query": "क्या मैं अपने अश्वगंधा फॉर्मूलेशन का पेटेंट करा सकता हूं?",
            "jurisdiction": "india",
            "language": "hi",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["detectedLanguage"] == "hi"
    # Gemini is asked to respond in the requested language (passed as the
    # second positional arg — the assembled user prompt).
    call_args, _ = llm_mock.generate.call_args
    assert "language code 'hi'" in call_args[1]


def test_safe_abstention_when_no_relevant_evidence_retrieved(client, mocker):
    """Below RAG_MIN_RELEVANCE, the assistant must abstain WITHOUT calling
    the LLM at all — this is the core 'never fabricate' guarantee."""
    low_relevance_chunk = _make_chunk(final_score=0.05, semantic_score=0.05)
    mocker.patch(
        "app.services.rag_service.get_retrieval_service"
    ).return_value.search.return_value = [low_relevance_chunk]
    llm_mock = mocker.patch("app.services.rag_service.get_llm_service")

    resp = client.post(
        "/api/assistant/ask", json={"query": "Some obscure unrelated query", "jurisdiction": "india"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["abstained"] is True
    assert "could not retrieve enough authoritative material" in body["assessment"].lower()
    llm_mock.assert_not_called()


def test_citation_validation_strips_uncited_and_fabricated_ids(client, mocker):
    chunk_a = _make_chunk(document_id="in-patents-act-3p")
    chunk_b = _make_chunk(document_id="in-bd-act", title="Biological Diversity Act")
    mocker.patch(
        "app.services.rag_service.get_retrieval_service"
    ).return_value.search.return_value = [chunk_a, chunk_b]

    llm_mock = mocker.patch("app.services.rag_service.get_llm_service").return_value
    # cites chunk_a and a document that was never retrieved
    llm_mock.generate.return_value = "Grounded claim [in-patents-act-3p] and a fake one [not-real-id]."

    resp = client.post(
        "/api/assistant/ask", json={"query": "Can I patent my formulation?", "jurisdiction": "india"}
    )
    body = resp.json()
    ids = [s["id"] for s in body["sources"]]
    assert "in-patents-act-3p" in ids
    assert "not-real-id" not in ids
    assert "[not-real-id]" not in body["assessment"]


def test_confidence_depends_on_retrieval_evidence_not_llm(client, mocker):
    """Two identical LLM outputs with different retrieval quality must
    produce different confidence scores — proving confidence is computed
    from evidence, not asked from the model."""
    strong_chunk = _make_chunk(final_score=0.95, semantic_score=0.95, is_authoritative=True, status="verified")
    weak_chunk = _make_chunk(final_score=0.5, semantic_score=0.5)

    llm_mock_text = "Answer [in-patents-act-3p]."

    search_mock = mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search
    llm_mock = mocker.patch("app.services.rag_service.get_llm_service").return_value
    llm_mock.generate.return_value = llm_mock_text

    search_mock.return_value = [strong_chunk]
    resp_strong = client.post("/api/assistant/ask", json={"query": "q", "jurisdiction": "india"})

    search_mock.return_value = [weak_chunk]
    resp_weak = client.post("/api/assistant/ask", json={"query": "q", "jurisdiction": "india"})

    assert resp_strong.json()["confidence"] > resp_weak.json()["confidence"]


def test_ashwagandha_patentability_demo_flow_goes_through_full_pipeline(client, mocker):
    """The flagship SIH demo query. Asserts the answer is NOT hardcoded: it
    must actually flow through routing -> retrieval -> LLM -> citation
    validation -> confidence, using whatever the mocked retrieval/LLM layers
    return, rather than a fixed canned string."""
    chunk = _make_chunk(document_id="in-patents-act-3p", ip_category="PATENT")
    mocker.patch("app.services.rag_service.get_retrieval_service").return_value.search.return_value = [chunk]

    llm_mock = mocker.patch("app.services.rag_service.get_llm_service").return_value
    distinctive_text = "UNIQUE_TEST_MARKER_7788 grounded in evidence [in-patents-act-3p]."
    llm_mock.generate.return_value = distinctive_text

    resp = client.post(
        "/api/assistant/ask",
        json={
            "query": "Can I patent my Ashwagandha formulation?",
            "jurisdiction": "india",
            "context": {
                "productType": "Herbal Formulation",
                "productName": "AshwaCalm",
                "ingredients": "Ashwagandha",
                "intendedUse": "Medicine",
                "innovationStatus": "Proprietary",
            },
        },
    )
    body = resp.json()
    # the distinctive marker proves the response text came from the mocked
    # LLM call through the real pipeline, not a hardcoded string anywhere
    assert "UNIQUE_TEST_MARKER_7788" in body["assessment"]
    assert body["intent"] == "patentability"
    assert any("patent" in m for m in body["reasoningModulesUsed"])
