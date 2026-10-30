from app.filters import RecordFilter
from app.repository import RecordRepository


def make_repository():
    repository = RecordRepository(":memory:")
    repository.add("Lease agreement, Building B", "dana")
    repository.add("Vendor onboarding checklist", "li")
    repository.add('Q2 "priority" accounts review', "dana", status="archived")
    return repository


def test_list_returns_records_in_id_order():
    assert [record.id for record in make_repository().list()] == [1, 2, 3]


def test_list_combines_status_and_owner():
    records = make_repository().list(RecordFilter(status="active", owner="dana"))
    assert [record.id for record in records] == [1]


def test_title_search_is_case_insensitive():
    records = make_repository().list(RecordFilter(q="VENDOR"))
    assert [record.id for record in records] == [2]
