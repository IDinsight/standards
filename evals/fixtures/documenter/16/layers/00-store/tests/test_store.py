import pytest

from records import Record, RecordStore

RECORDS = [
    Record(3, "Budget review", "dana", "archived", "2026-01-10T09:00:00Z"),
    Record(1, "Lease agreement", "dana", "active", "2026-01-02T09:00:00Z"),
    Record(2, "Vendor checklist", "li", "active", "2026-01-05T09:00:00Z"),
]


def test_list_orders_by_id():
    assert [record.id for record in RecordStore(RECORDS).list()] == [1, 2, 3]


def test_list_combines_filters():
    store = RecordStore(RECORDS)
    assert [record.id for record in store.list(status="active", owner="dana")] == [1]


def test_list_rejects_unknown_status():
    with pytest.raises(ValueError, match="unknown status: deleted"):
        RecordStore(RECORDS).list(status="deleted")


def test_add_replaces_same_id():
    store = RecordStore(RECORDS)
    store.add(Record(2, "Vendor checklist v2", "li", "active", "2026-01-05T09:00:00Z"))
    assert store.get(2).title == "Vendor checklist v2"


def test_get_missing_returns_none():
    assert RecordStore(RECORDS).get(99) is None
