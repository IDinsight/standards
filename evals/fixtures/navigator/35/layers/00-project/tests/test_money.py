from decimal import Decimal

from ledger.money import round_amount


def test_half_even_is_default():
    assert round_amount("2.665") == Decimal("2.66")


def test_half_up():
    assert round_amount("2.665", mode="half_up") == Decimal("2.67")


def test_whole_units():
    assert round_amount(10, places=0) == Decimal("10")
