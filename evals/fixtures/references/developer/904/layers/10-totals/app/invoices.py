"""Invoice arithmetic. Amounts are integer cents; tax rates are basis points."""

from collections.abc import Iterable
from dataclasses import dataclass


@dataclass(frozen=True)
class Line:
    quantity: int
    unit_price_cents: int


@dataclass(frozen=True)
class Totals:
    subtotal_cents: int
    tax_cents: int
    total_cents: int


def compute_totals(lines: Iterable[Line], tax_rate_bp: int) -> Totals:
    if tax_rate_bp < 0:
        raise ValueError("tax rate cannot be negative")
    subtotal = sum(line.quantity * line.unit_price_cents for line in lines)
    # Round half up to the nearest cent.
    tax = (subtotal * tax_rate_bp + 5_000) // 10_000
    return Totals(subtotal_cents=subtotal, tax_cents=tax, total_cents=subtotal + tax)
