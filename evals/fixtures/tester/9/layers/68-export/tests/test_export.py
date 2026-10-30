import io
from datetime import datetime, timezone

from app.export import write_csv
from app.repository import Record

CREATED = datetime(2026, 3, 2, 10, 15, tzinfo=timezone.utc)


def record(id, title, owner="dana", status="active"):
    return Record(id, title, owner, status, CREATED)


def test_write_csv_writes_header_and_crlf_rows():
    out = io.StringIO()
    count = write_csv([record(1, "Office move inventory"), record(4, "Data retention policy", status="archived")], out)
    assert count == 2
    assert out.getvalue() == (
        "id,title,owner,status,created_at\r\n"
        "1,Office move inventory,dana,active,2026-03-02T10:15:00+00:00\r\n"
        "4,Data retention policy,dana,archived,2026-03-02T10:15:00+00:00\r\n"
    )


def test_write_csv_quotes_commas_quotes_and_line_breaks():
    out = io.StringIO()
    write_csv(
        [record(1, "Lease agreement, Building B"), record(3, 'Q2 "priority" review'), record(5, "first line\nsecond line")],
        out,
    )
    rows = out.getvalue().split("\r\n")
    assert rows[1] == '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00+00:00'
    assert rows[2] == '3,"Q2 ""priority"" review",dana,active,2026-03-02T10:15:00+00:00'
    assert rows[3] == '5,"first line\nsecond line",dana,active,2026-03-02T10:15:00+00:00'
