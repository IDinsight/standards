from dataclasses import dataclass
from datetime import date
from typing import Optional


@dataclass(frozen=True)
class Beneficiary:
    beneficiary_id: str
    household_id: str
    full_name: str
    date_of_birth: Optional[date]
    sex: str
    phone: Optional[str]
    consent_to_contact: bool
    enrolled_on: date
    active: bool = True
