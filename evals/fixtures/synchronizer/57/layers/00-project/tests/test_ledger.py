from decimal import Decimal

import pytest

from tally.ledger import LedgerError, blank_categories, load_rows, totals


def write(tmp_path, text):
    path = tmp_path / "ledger.csv"
    path.write_text(text, encoding="utf-8")
    return path


def test_totals_by_category(tmp_path):
    rows = load_rows(write(tmp_path, "date,category,amount\n2026-08-01,food,1.50\n2026-08-02,food,2.25\n2026-08-03,bus,3\n"))
    assert totals(rows) == {"bus": Decimal("3"), "food": Decimal("3.75")}


def test_totals_by_month(tmp_path):
    rows = load_rows(write(tmp_path, "date,category,amount\n2026-08-01,food,1.50\n2026-09-02,food,2.25\n2026-09-03,bus,3\n"))
    assert totals(rows, by="month") == {"2026-08": Decimal("1.50"), "2026-09": Decimal("5.25")}


def test_missing_column_is_rejected(tmp_path):
    with pytest.raises(LedgerError, match="amount"):
        load_rows(write(tmp_path, "date,category\n2026-08-01,food\n"))


def test_bad_amount_names_the_line(tmp_path):
    with pytest.raises(LedgerError, match="line 3"):
        load_rows(write(tmp_path, "date,category,amount\n2026-08-01,food,1\n2026-08-02,food,ten\n"))


def test_blank_categories_reports_lines(tmp_path):
    rows = load_rows(write(tmp_path, "date,category,amount\n2026-08-01,food,1\n2026-08-02, ,2\n"))
    assert blank_categories(rows) == [3]
