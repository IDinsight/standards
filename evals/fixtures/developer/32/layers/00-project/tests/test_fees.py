from datetime import date
from decimal import Decimal

from loans.fees import days_late, overdue_fee


def test_early_return_has_no_days_late():
    assert days_late(date(2026, 3, 10), date(2026, 3, 9)) == 0


def test_days_late_counts_calendar_days():
    assert days_late(date(2026, 3, 10), date(2026, 3, 14)) == 4


def test_fee_uses_daily_rate():
    assert overdue_fee(date(2026, 3, 10), date(2026, 3, 14)) == Decimal("1.00")


def test_on_time_return_is_free():
    assert overdue_fee(date(2026, 3, 10), date(2026, 3, 10)) == Decimal("0")
