import pytest
from fastapi.testclient import TestClient

from app.main import app, store


@pytest.fixture
def client() -> TestClient:
    store.clear()
    return TestClient(app)
