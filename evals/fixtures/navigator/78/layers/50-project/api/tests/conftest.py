import pytest

from app.auth import hash_key
from app.persistence.db import connect
from app.persistence.migrate import apply_migrations
from app.persistence.repository import Repository


@pytest.fixture
def conn(tmp_path, monkeypatch):
    db_path = tmp_path / "test.sqlite3"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    connection = connect(str(db_path))
    apply_migrations(connection)
    yield connection
    connection.close()


@pytest.fixture
def repo(conn):
    return Repository(conn)


@pytest.fixture
def api_key(repo):
    raw = "test-key-0001"
    repo.add_api_key("tests", hash_key(raw))
    return raw
