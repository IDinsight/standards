from datetime import date
from decimal import Decimal

DAILY_RATE = Decimal("0.25")


def days_late(due: date, returned: date) -> int:
    """Return the number of calendar days a loan was returned after its due date."""
    return max((returned - due).days, 0)


def overdue_fee(due: date, returned: date, daily_rate: Decimal = DAILY_RATE) -> Decimal:
    """Return the overdue fee for one loan."""
    return daily_rate * days_late(due, returned)
