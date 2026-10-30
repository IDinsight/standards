from shipping.rates import load_rates

PER_KG = 1.25
TIERS = ("standard", "express")


def quote(zone, weight_kg=1.0, tier="standard", rates=None):
    """Price for a parcel: the zone rate covers the first kilo, then PER_KG per extra kilo."""
    if tier not in TIERS:
        raise ValueError(f"unknown tier: {tier}")
    rates = rates if rates is not None else load_rates()
    base = rates[zone][tier]
    extra = max(0.0, weight_kg - 1.0) * PER_KG
    return round(base + extra, 2)
