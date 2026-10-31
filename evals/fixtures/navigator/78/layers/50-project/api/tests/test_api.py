import pytest

pytest.importorskip("fastapi")
pytest.importorskip("httpx")

from fastapi.testclient import TestClient  # noqa: E402

from app.auth import hash_key  # noqa: E402
from app.deps import get_connection  # noqa: E402
from app.main import create_app  # noqa: E402

URL = "/surveys/intake/responses"
BODY = {"respondent_ref": "R-1", "answers": {"q1": "yes"}}


@pytest.fixture
def client(conn, repo):
    repo.add_survey("intake", "Clinic intake")
    app = create_app()
    app.dependency_overrides[get_connection] = lambda: conn
    return TestClient(app)


def test_submit_without_key_returns_401(client):
    response = client.post(URL, json=BODY)
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_submit_with_revoked_key_returns_401(client, repo):
    key_id = repo.add_api_key("old partner", hash_key("old-key"))
    repo.revoke_api_key(key_id)
    response = client.post(URL, json=BODY, headers={"Authorization": "Bearer old-key"})
    assert response.status_code == 401


def test_submit_with_valid_key_returns_201(client, api_key):
    response = client.post(URL, json=BODY, headers={"Authorization": f"Bearer {api_key}"})
    assert response.status_code == 201
    assert response.json()["answers"] == {"q1": "yes"}
