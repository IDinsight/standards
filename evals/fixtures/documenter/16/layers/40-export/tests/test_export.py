import pytest

from records import Record, RecordStore
from records.export import DEFAULT_COLUMNS, csv_rows

RECORDS = [
    Record(1, "Lease agreement, Building B", "dana", "active", "2026-03-02T10:15:00Z"),
    Record(2, "Vendor onboarding checklist", "li", "active", "2026-03-09T14:40:00Z"),
    Record(3, 'Q2 "priority" accounts review', "dana", "archived", "2026-04-01T08:05:00Z"),
    Record(4, "Insurance renewal 2026", "marco", "active", "2026-04-18T16:20:00Z"),
]


def test_export_quotes_commas_and_doubles_quotes(tmp_path):
    target = tmp_path / "out.csv"
    count = RecordStore(RECORDS).export_csv(target, owner="dana")
    assert count == 2
    assert target.read_bytes().decode("utf-8") == (
        "id,title,owner,status,created_at\r\n"
        '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
        '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n'
    )


def test_export_applies_status_filter(tmp_path):
    target = tmp_path / "out.csv"
    assert RecordStore(RECORDS).export_csv(target, status="active") == 3
    lines = target.read_bytes().decode("utf-8").split("\r\n")[1:-1]
    assert [line.split(",")[0] for line in lines] == ["1", "2", "4"]


def test_export_writes_selected_columns_in_order(tmp_path):
    target = tmp_path / "out.csv"
    RecordStore(RECORDS).export_csv(target, owner="marco", columns=("title", "id"))
    assert target.read_bytes().decode("utf-8") == "title,id\r\nInsurance renewal 2026,4\r\n"


def test_export_with_no_matches_writes_header_only(tmp_path):
    target = tmp_path / "out.csv"
    assert RecordStore(RECORDS).export_csv(target, owner="nobody") == 0
    assert target.read_bytes().decode("utf-8") == "id,title,owner,status,created_at\r\n"


def test_export_quotes_line_breaks(tmp_path):
    target = tmp_path / "out.csv"
    store = RecordStore([Record(9, "Move plan\nphase 1", "li", "active", "2026-05-01T09:00:00Z")])
    store.export_csv(target, columns=("id", "title"))
    assert target.read_bytes().decode("utf-8") == 'id,title\r\n9,"Move plan\nphase 1"\r\n'


def test_unknown_column_raises_before_writing(tmp_path):
    target = tmp_path / "out.csv"
    with pytest.raises(ValueError, match="unknown column: email"):
        RecordStore(RECORDS).export_csv(target, columns=("id", "email"))
    assert not target.exists()


def test_unknown_status_raises_before_writing(tmp_path):
    target = tmp_path / "out.csv"
    with pytest.raises(ValueError, match="unknown status: deleted"):
        RecordStore(RECORDS).export_csv(target, status="deleted")
    assert not target.exists()


def test_csv_rows_header_then_values():
    assert csv_rows(RECORDS[:1], ("id", "owner")) == [["id", "owner"], [1, "dana"]]


def test_default_columns_cover_every_record_field():
    assert DEFAULT_COLUMNS == ("id", "title", "owner", "status", "created_at")
