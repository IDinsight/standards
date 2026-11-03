"""Fixtures for tests against the PostgreSQL service in compose.test.yaml.

Start it with `docker compose -f compose.test.yaml up -d` and set
TEST_DATABASE_URL=postgresql://records:records@localhost:55432/records_test.
Each test gets its own schema, dropped afterwards.
"""
import os
import uuid

import pytest

from app.db import apply_schema


@pytest.fixture(scope="session")
def database_url():
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        pytest.skip("TEST_DATABASE_URL is not set; start the PostgreSQL service in compose.test.yaml to run integration tests")
    return url


@pytest.fixture
def conn(database_url):
    psycopg = pytest.importorskip("psycopg")
    schema = f"test_{uuid.uuid4().hex[:12]}"
    with psycopg.connect(database_url, autocommit=True) as admin:
        admin.execute(f"CREATE SCHEMA {schema}")
    connection = psycopg.connect(database_url, options=f"-c search_path={schema}")
    try:
        apply_schema(connection)
        connection.commit()
        yield connection
    finally:
        connection.close()
        with psycopg.connect(database_url, autocommit=True) as admin:
            admin.execute(f"DROP SCHEMA {schema} CASCADE")
