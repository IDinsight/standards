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
    assert summarize(ENTRIES) == [("groceries", Decimal("59.35")), ("rent", Decimal("900.00"))]


def test_summarize_filters_account():
    assert summarize(ENTRIES, account="rent") == [("rent", Decimal("900.00"))]


def test_write_report_lines():
    out = io.StringIO()
    write_report(summarize(ENTRIES), out)
    assert out.getvalue() == "groceries\t59.35\nrent\t900.00\n"
