import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("IMPORT_MAX_BYTES", "1048576")

import hashlib  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402

AUTH = {"Authorization": "Bearer test-token"}


@pytest.fixture
def client(tmp_path):
    app = create_app(Settings("sqlite:///:memory:", str(tmp_path), 64))
    with app.state.db:
        app.state.db.execute("INSERT INTO api_tokens VALUES (?, ?)", (hashlib.sha256(b"test-token").hexdigest(), "tests"))
    return TestClient(app)


def upload(client, content=b"id\n1\n", headers=AUTH):
    return client.post("/imports", files={"file": ("rows.csv", content, "text/csv")}, headers=headers)


def test_missing_token_is_rejected(client):
    response = upload(client, headers={})
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_upload_is_accepted_as_pending_job(client):
    response = upload(client)
    assert response.status_code == 202
    assert response.json()["status"] == "pending"
    assert set(response.json()) == {"id", "status", "created_at", "error"}


def test_reused_key_with_different_file_conflicts(client):
    headers = {**AUTH, "Idempotency-Key": "batch-7"}
    first = upload(client, headers=headers)
    assert upload(client, headers=headers).json()["id"] == first.json()["id"]
    assert upload(client, content=b"id\n2\n", headers=headers).status_code == 409


def test_failed_import_reports_error(client):
    job = upload(client, content=b"\xff\xfe\x00").json()
    body = client.get(f"/imports/{job['id']}", headers=AUTH).json()
    assert body["status"] == "failed" and body["error"]
