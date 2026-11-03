from datetime import datetime, timedelta, timezone

from records.export import csv_cell, export_file_name, to_csv
from records.store import RecordItem


def test_plain_values_are_written_unquoted():
    assert csv_cell("Insurance renewal 2026") == "Insurance renewal 2026"
    assert csv_cell(42) == "42"


def test_values_containing_a_comma_are_quoted():
    assert csv_cell("Lease agreement, Building B") == '"Lease agreement, Building B"'


def test_double_quotes_are_doubled_and_the_value_is_quoted():
    assert csv_cell('Q2 "priority" accounts review') == '"Q2 ""priority"" accounts review"'


def test_values_containing_line_breaks_are_quoted():
    assert csv_cell("first line\nsecond line") == '"first line\nsecond line"'
    assert csv_cell("first line\r\nsecond line") == '"first line\r\nsecond line"'


def test_to_csv_writes_a_header_and_one_crlf_row_per_record():
    records = [
        RecordItem(7, "Budget, draft", "li", "active", "2026-01-05T09:00:00Z"),
        RecordItem(9, "Archive index", "dana", "archived", "2026-02-11T15:30:00Z"),
    ]
    assert to_csv(records) == (
        "id,title,owner,status,created_at\r\n"
        '7,"Budget, draft",li,active,2026-01-05T09:00:00Z\r\n'
        "9,Archive index,dana,archived,2026-02-11T15:30:00Z\r\n"
    )


def test_export_file_name_uses_the_utc_time_to_the_second():
    now = datetime(2026, 9, 24, 11, 0, 5, tzinfo=timezone(timedelta(hours=2)))
    assert export_file_name(now) == "records-20260924T090005Z.csv"
