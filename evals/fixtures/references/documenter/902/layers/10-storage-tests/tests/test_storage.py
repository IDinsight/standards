import pytest

from app.storage import ImportStore, sqlite_path


def test_create_then_get_returns_same_record():
    store = ImportStore(":memory:")
    record = store.create("stock.csv", status="completed", row_count=4)
    assert store.get(record["id"]) == record
    assert record["filename"] == "stock.csv"
    assert record["row_count"] == 4


def test_get_unknown_id_returns_none():
    assert ImportStore(":memory:").get("missing") is None


def test_sqlite_path_requires_sqlite_url():
    assert sqlite_path("sqlite:///./data/imports.db") == "./data/imports.db"
    with pytest.raises(ValueError):
        sqlite_path("mysql://localhost/imports")
