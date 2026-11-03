from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Household:
    household_id: str
    head_name: str
    district: str
    size: int
    registered_on: date
    archived: bool = False
