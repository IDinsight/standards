from dataclasses import dataclass


@dataclass(frozen=True)
class Parcel:
    parcel_id: str
    destination: str
    weight_grams: int
