from fastapi.testclient import TestClient

from app.main import app


def test_health_needs_no_token():
    assert TestClient(app).get("/health").status_code == 200


def test_missing_token_is_rejected():
    assert TestClient(app).get("/items").status_code == 401


def test_wrong_token_is_rejected():
    response = TestClient(app).get("/items", headers={"Authorization": "Bearer nope"})
    assert response.status_code == 401
