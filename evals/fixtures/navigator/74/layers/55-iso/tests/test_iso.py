import pytest

from pacer.iso import parse_iso


def test_hours_and_minutes():
    assert parse_iso("PT1H30M") == 5400


def test_days():
    assert parse_iso("P1D") == 86400


def test_rejects_empty():
    with pytest.raises(ValueError):
        parse_iso("")
