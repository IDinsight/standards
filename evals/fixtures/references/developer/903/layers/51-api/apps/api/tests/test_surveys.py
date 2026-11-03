from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_normalizes_code(client: TestClient) -> None:
    response = client.post("/surveys", json={"code": " hh-24 ", "title": "Household 2024"})
    assert response.status_code == 201
    assert response.json() == {"code": "HH-24", "title": "Household 2024", "status": "draft"}


def test_get_accepts_any_case(client: TestClient) -> None:
    client.post("/surveys", json={"code": "FAC-01", "title": "Facility census"})
    response = client.get("/surveys/fac-01")
    assert response.status_code == 200
    assert response.json()["code"] == "FAC-01"


def test_duplicate_code_conflicts(client: TestClient) -> None:
    client.post("/surveys", json={"code": "HH-24", "title": "Household 2024"})
    response = client.post("/surveys", json={"code": "hh-24", "title": "Again"})
    assert response.status_code == 409


def test_missing_survey_is_404(client: TestClient) -> None:
    assert client.get("/surveys/NOPE").status_code == 404


def test_list_is_sorted_by_code(client: TestClient) -> None:
    for code in ("ZZ-9", "AA-1"):
        client.post("/surveys", json={"code": code, "title": code})
    assert [s["code"] for s in client.get("/surveys").json()] == ["AA-1", "ZZ-9"]
