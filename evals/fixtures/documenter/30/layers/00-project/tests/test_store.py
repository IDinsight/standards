import pytest

from records.errors import HttpError
from records.filters import parse_filter
from records.store import RecordFilter, RecordItem, RecordStore

RECORDS = [
    RecordItem(3, "Budget review", "dana", "archived", "2026-01-10T09:00:00Z"),
    RecordItem(1, "Lease agreement", "dana", "active", "2026-01-02T09:00:00Z"),
    RecordItem(2, "Vendor checklist", "li", "active", "2026-01-05T09:00:00Z"),
]


def ids(records):
    return [record.id for record in records]


def test_find_returns_every_record_ordered_by_id():
    assert ids(RecordStore(RECORDS).find()) == [1, 2, 3]


def test_find_combines_status_and_owner():
    assert ids(RecordStore(RECORDS).find(RecordFilter(status="active", owner="dana"))) == [1]


def test_title_search_is_case_insensitive():
    assert ids(RecordStore(RECORDS).find(RecordFilter(q="LEASE"))) == [1]


def test_parse_filter_trims_and_ignores_blank_and_unknown_parameters():
    query = {"status": "archived", "owner": " dana ", "q": "", "page": "2"}
    assert parse_filter(query) == RecordFilter(status="archived", owner="dana")


def test_parse_filter_rejects_an_unknown_status():
    with pytest.raises(HttpError) as raised:
        parse_filter({"status": "deleted"})
    assert raised.value.status == 400
