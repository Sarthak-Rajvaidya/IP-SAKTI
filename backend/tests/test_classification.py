from __future__ import annotations


def _answers(overrides=None):
    base = {
        1: "Herbal Formulation",
        2: "Yes, directly",
        3: "No modification",
        4: "Therapeutic / Medicine",
        5: "India only",
        6: "No",
    }
    base.update(overrides or {})
    return [{"step": s, "question": f"q{s}", "answer": a} for s, a in base.items()]


def test_classical_formulation_classified_correctly(client):
    resp = client.post("/api/classification", json={"answers": _answers()})
    assert resp.status_code == 200
    body = resp.json()
    assert body["category"] == "classical"
    assert "Classical" in body["label"]
    assert body["confidence"] > 0


def test_modified_formulation_classified_as_proprietary(client):
    resp = client.post(
        "/api/classification",
        json={"answers": _answers({2: "Partially / inspired by", 3: "Yes, significantly modified", 6: "Yes"})},
    )
    body = resp.json()
    assert body["category"] == "proprietary"
    assert any("biological" in r.lower() or "abs" in r.lower() for r in body["reasons"])


def test_cosmetic_intended_use_overrides_classification(client):
    resp = client.post("/api/classification", json={"answers": _answers({4: "Cosmetic"})})
    body = resp.json()
    assert body["category"] == "cosmetic"


def test_empty_answers_returns_low_confidence_uncertainty(client):
    resp = client.post("/api/classification", json={"answers": []})
    body = resp.json()
    assert body["confidence"] < 50
    assert "no_answers_provided" in body["uncertaintyFlags"]
