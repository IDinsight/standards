from datetime import date
from decimal import Decimal

from loans.report import member_total


def test_member_total_sums_loans():
    loans = [
        (date(2026, 3, 10), date(2026, 3, 14)),
        (date(2026, 3, 1), date(2026, 3, 3)),
    ]
    assert member_total(loans) == Decimal("1.50")


def test_member_total_empty():
    assert member_total([]) == Decimal("0")
