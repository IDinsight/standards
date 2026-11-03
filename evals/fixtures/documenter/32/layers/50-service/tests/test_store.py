from recordsvc.store import RecordItem, RecordStore

RECORDS = [
    RecordItem(3, "Budget review", "dana", "archived", "2026-01-10T09:00:00Z"),
    RecordItem(1, "Lease agreement", "dana", "active", "2026-01-02T09:00:00Z"),
    RecordItem(2, "Vendor checklist", "li", "active", "2026-01-05T09:00:00Z"),
]


def ids(records):
    return [record.id for record in records]


def test_list_returns_every_record_ordered_by_id():
    assert ids(RecordStore(RECORDS).list()) == [1, 2, 3]


def test_list_combines_status_and_owner():
    assert ids(RecordStore(RECORDS).list(status="active", owner="dana")) == [1]


def test_title_search_is_case_insensitive():
    assert ids(RecordStore(RECORDS).list(q="LEASE")) == [1]
