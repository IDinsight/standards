from collections.abc import Iterable
from datetime import date
from decimal import Decimal

from loans.fees import overdue_fee


def member_total(loans: Iterable[tuple[date, date]]) -> Decimal:
    """Return the sum of overdue fees for a member's returned loans."""
    return sum((overdue_fee(due, returned) for due, returned in loans), Decimal("0"))
