from decimal import ROUND_HALF_UP, Decimal

from parcels.models import Parcel
from parcels.zones import zone_for

# Published 2026 rate card: base price and price per billable kilogram, in EUR.
RATES = {
    "A": (Decimal("4.95"), Decimal("1.10")),
    "B": (Decimal("6.40"), Decimal("1.75")),
    "C": (Decimal("9.80"), Decimal("2.60")),
}
FUEL_SURCHARGE = Decimal("0.035")
CENT = Decimal("0.01")


def billable_kg(weight_grams: int) -> int:
    """Weight rounded up to whole kilograms, at least 1."""
    return max(1, -(-weight_grams // 1000))


def parcel_cost(parcel: Parcel) -> Decimal:
    """Price of one parcel in EUR, including the fuel surcharge."""
    base, per_kg = RATES[zone_for(parcel.destination)]
    subtotal = base + per_kg * billable_kg(parcel.weight_grams)
    return (subtotal * (1 + FUEL_SURCHARGE)).quantize(CENT, rounding=ROUND_HALF_UP)
