import pytest

from validate import RowError, parse_row


def test_parses_a_complete_row():
    row = {"id": " t1 ", "date": "2026-01-02", "account": "cash", "amount": "12.50", "memo": " coffee "}
    assert parse_row(row) == ("t1", "2026-01-02", "cash", "12.50", "coffee")


def test_memo_is_optional():
    row = {"id": "t2", "date": "2026-01-03", "account": "bank", "amount": "-40"}
    assert parse_row(row)[4] == ""


def test_reports_missing_columns():
    with pytest.raises(RowError, match="missing account, amount"):
        parse_row({"id": "t3", "date": "2026-01-03", "account": " "})


def test_rejects_bad_amount():
    with pytest.raises(RowError, match="bad amount"):
        parse_row({"id": "t4", "date": "2026-01-03", "account": "cash", "amount": "abc"})
