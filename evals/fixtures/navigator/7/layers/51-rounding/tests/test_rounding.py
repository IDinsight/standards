from fxrates.convert import Converter


def converter(rate):
    return Converter(fetch=lambda base, quote: rate)


def test_rounds_to_requested_places():
    assert converter(149.567).convert(10, "USD", "JPY", places=0) == 1496.0


def test_half_even_is_default():
    assert converter(0.125).convert(1, "USD", "GBP") == 0.12


def test_half_up_rounding():
    assert converter(0.125).convert(1, "USD", "GBP", rounding="half_up") == 0.13
