import pytest

from pacer.readable import parse_readable


def test_hours_and_minutes():
    assert parse_readable("1h 30m") == 5400


def test_units_any_order_and_case():
    assert parse_readable("10S 2M") == 130


def test_rejects_unknown_unit():
    with pytest.raises(ValueError):
        parse_readable("3 weeks")


def test_blank_without_default_raises():
    with pytest.raises(ValueError):
        parse_readable("   ")


def test_blank_with_default():
    assert parse_readable("", default=0) == 0
