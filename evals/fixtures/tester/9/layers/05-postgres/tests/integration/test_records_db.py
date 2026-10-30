import pytest

from app.filters import RecordFilter
from app.repository import add_record, list_records

pytestmark = pytest.mark.integration


def test_list_records_filters_by_owner_in_id_order(conn):
    add_record(conn, "Lease agreement, Building B", "dana")
    add_record(conn, "Vendor onboarding checklist", "li")
    add_record(conn, 'Q2 "priority" accounts review', "dana", status="archived")
    records = list_records(conn, RecordFilter(owner="dana"))
    assert [record.title for record in records] == ["Lease agreement, Building B", 'Q2 "priority" accounts review']


def test_title_search_is_case_insensitive_and_literal(conn):
    add_record(conn, "50%_off promotion", "li")
    add_record(conn, "500 offices", "li")
    records = list_records(conn, RecordFilter(q="50%_OFF"))
    assert [record.title for record in records] == ["50%_off promotion"]
