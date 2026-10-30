from decimal import Decimal

# Published 2026 rate card: base price and price per billable kilogram, in EUR.
RATES = {
    "A": (Decimal("4.95"), Decimal("1.10")),
    "B": (Decimal("6.40"), Decimal("1.75")),
    "C": (Decimal("9.80"), Decimal("2.60")),
}
FUEL_SURCHARGE = Decimal("0.035")
