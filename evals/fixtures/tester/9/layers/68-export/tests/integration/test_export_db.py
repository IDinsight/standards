import io

import pytest

from app.export import export_csv
from app.filters import RecordFilter
from app.repository import add_record

pytestmark = pytest.mark.integration


def test_export_csv_writes_the_filtered_records(conn):
    add_record(conn, "Lease agreement, Building B", "dana")
    add_record(conn, "Vendor onboarding checklist", "li")
    add_record(conn, 'Q2 "priority" accounts review', "dana", status="archived")
    conn.commit()
    out = io.StringIO()
    assert export_csv(conn, RecordFilter(owner="dana"), out, batch_size=1) == 2
    rows = out.getvalue().split("\r\n")
    assert rows[0] == "id,title,owner,status,created_at"
    assert rows[1].startswith('1,"Lease agreement, Building B",dana,active,')
    assert rows[2].startswith('3,"Q2 ""priority"" accounts review",dana,archived,')
