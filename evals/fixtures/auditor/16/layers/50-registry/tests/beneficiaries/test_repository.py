from datetime import date

from app.beneficiaries.models import Beneficiary
from app.beneficiaries.repository import BeneficiaryRepository


def person(beneficiary_id, household_id, active=True):
    return Beneficiary(beneficiary_id, household_id, "Name", None, "F", None, False, date(2026, 1, 5), active)


def test_for_household_returns_members_only():
    repo = BeneficiaryRepository([person("B-1", "H-1"), person("B-2", "H-2"), person("B-3", "H-1")])
    assert [b.beneficiary_id for b in repo.for_household("H-1")] == ["B-1", "B-3"]


def test_active_excludes_inactive():
    repo = BeneficiaryRepository([person("B-1", "H-1"), person("B-2", "H-1", active=False)])
    assert [b.beneficiary_id for b in repo.active()] == ["B-1"]
