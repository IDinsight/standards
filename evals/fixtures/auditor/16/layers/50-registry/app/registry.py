import json
from dataclasses import dataclass
from datetime import date

from app.beneficiaries.models import Beneficiary
from app.beneficiaries.repository import BeneficiaryRepository
from app.households.models import Household
from app.households.repository import HouseholdRepository


@dataclass
class Registry:
    households: HouseholdRepository
    beneficiaries: BeneficiaryRepository


def _date(value):
    return date.fromisoformat(value) if value else None


def load_registry(path):
    """Load households and beneficiaries from a registry JSON file."""
    with open(path, encoding="utf-8") as fh:
        raw = json.load(fh)
    households = [
        Household(
            household_id=item["household_id"],
            head_name=item["head_name"],
            district=item["district"],
            size=item["size"],
            registered_on=_date(item["registered_on"]),
            archived=item.get("archived", False),
        )
        for item in raw.get("households", [])
    ]
    beneficiaries = [
        Beneficiary(
            beneficiary_id=item["beneficiary_id"],
            household_id=item["household_id"],
            full_name=item["full_name"],
            date_of_birth=_date(item.get("date_of_birth")),
            sex=item["sex"],
            phone=item.get("phone"),
            consent_to_contact=item.get("consent_to_contact", False),
            enrolled_on=_date(item["enrolled_on"]),
            active=item.get("active", True),
        )
        for item in raw.get("beneficiaries", [])
    ]
    return Registry(HouseholdRepository(households), BeneficiaryRepository(beneficiaries))
