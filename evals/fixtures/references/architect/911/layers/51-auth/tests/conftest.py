import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db import Base, get_session
from app.main import app

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5433/inventory_api_test",
)
TEST_TOKEN = "test-token"


@pytest.fixture(autouse=True)
def api_tokens(monkeypatch):
    monkeypatch.setattr(settings, "api_tokens", TEST_TOKEN)


@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(engine):
    connection = engine.connect()
    transaction = connection.begin()
    TestSession = sessionmaker(bind=connection, join_transaction_mode="create_savepoint")

    def override():
        with TestSession() as session:
            yield session

    app.dependency_overrides[get_session] = override
    yield TestClient(app, headers={"Authorization": f"Bearer {TEST_TOKEN}"})
    app.dependency_overrides.clear()
    transaction.rollback()
    connection.close()
