import pytest

from catalog.store import Record, RecordStore


def make_store():
    return RecordStore([
        Record(3, "Budget review", "dana", "archived"),
        Record(1, "Lease agreement", "dana"),
        Record(2, "Vendor checklist", "li"),
    ])


def test_list_orders_by_id():
    assert [record.id for record in make_store().list()] == [1, 2, 3]


def test_list_filters_combine():
    assert [record.id for record in make_store().list(status="active", owner="dana")] == [1]


def test_add_replaces_same_id():
    store = make_store()
    store.add(Record(2, "Vendor onboarding", "li"))
    assert store.get(2).title == "Vendor onboarding"


def test_unknown_status_rejected():
    with pytest.raises(ValueError, match="unknown status: deleted"):
        RecordStore([Record(9, "Old memo", "li", "deleted")])
