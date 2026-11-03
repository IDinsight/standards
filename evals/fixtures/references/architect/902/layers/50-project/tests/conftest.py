import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.db import engine
from app.main import app


@pytest.fixture(autouse=True)
def clean_entries():
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE entries RESTART IDENTITY"))
    yield


@pytest.fixture
def client():
    return TestClient(app)
