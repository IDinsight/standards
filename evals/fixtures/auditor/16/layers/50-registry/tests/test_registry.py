from pathlib import Path

from app.registry import load_registry

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "sample_registry.json"


def test_loads_households_and_beneficiaries():
    registry = load_registry(SAMPLE)
    assert len(registry.households.all()) == 3
    assert len(registry.beneficiaries.all()) == 4


def test_optional_beneficiary_fields_default_to_none():
    registry = load_registry(SAMPLE)
    assert registry.beneficiaries.get("B-0002").phone is None
    assert registry.beneficiaries.get("B-0003").date_of_birth is None
