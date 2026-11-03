from decimal import ROUND_HALF_EVEN, ROUND_HALF_UP, Decimal

ROUNDING_MODES = {"half_even": ROUND_HALF_EVEN, "half_up": ROUND_HALF_UP}


def round_amount(amount, mode="half_even", places=2):
    quantum = Decimal(1).scaleb(-places)
    return Decimal(str(amount)).quantize(quantum, rounding=ROUNDING_MODES[mode])
