from collections import defaultdict

from parcels.models import Parcel
from parcels.zones import zone_for


def summarize(parcels: list[Parcel]) -> dict[str, dict]:
    """Group parcels by destination country code."""
    groups: dict[str, list[Parcel]] = defaultdict(list)
    for parcel in parcels:
        groups[parcel.destination.strip().upper()].append(parcel)
    return {
        code: {
            "zone": zone_for(code),
            "parcels": len(groups[code]),
            "weight_grams": sum(p.weight_grams for p in groups[code]),
        }
        for code in sorted(groups)
    }
