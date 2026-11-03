from shipping.rates import load_rates

PER_KG = 1.25


def quote(zone, weight_kg=1.0, rates=None):
    """Price for a parcel: the zone rate covers the first kilo, then PER_KG per extra kilo."""
    rates = rates or load_rates()
    base = rates[zone]["standard"]
    extra = max(0.0, weight_kg - 1.0) * PER_KG
    return round(base + extra, 2)
