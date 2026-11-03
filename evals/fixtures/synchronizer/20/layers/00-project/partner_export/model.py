from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Account:
    account_id: int
    name: str
    country: str
    status: str
    updated_on: date
