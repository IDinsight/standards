import io
from decimal import Decimal

from tally.ledger import Entry
from tally.report import summarize, write_report

ENTRIES = [
    Entry("2026-01-03", "groceries", Decimal("42.10")),
    Entry("2026-01-05", "rent", Decimal("900.00")),
    Entry("2026-01-09", "groceries", Decimal("17.25")),
]


def test_summarize_groups_by_account():
    assert summarize(ENTRIES) == [
        ("groceries", 2, Decimal("59.35")),
        ("rent", 1, Decimal("900.00")),
    ]


def test_summarize_filters_account():
    assert summarize(ENTRIES, account="rent") == [("rent", 1, Decimal("900.00"))]


def test_write_report_csv_with_header():
    out = io.StringIO()
    write_report(summarize(ENTRIES), out)
    assert out.getvalue() == "account,entries,total\ngroceries,2,59.35\nrent,1,900.00\n"
