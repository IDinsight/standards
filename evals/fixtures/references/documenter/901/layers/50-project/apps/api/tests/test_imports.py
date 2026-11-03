import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture
def client(tmp_path):
    return TestClient(create_app(Settings("sqlite:///:memory:", str(tmp_path))))


def test_upload_creates_job(client):
    response = client.post("/imports", files={"file": ("rows.csv", b"id\n1\n", "text/csv")})
    assert response.status_code == 201
    assert response.json()["status"] == "running"


def test_empty_file_is_rejected(client):
    assert client.post("/imports", files={"file": ("rows.csv", b"", "text/csv")}).status_code == 400
