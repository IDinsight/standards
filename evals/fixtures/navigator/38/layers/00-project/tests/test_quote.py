from shipping.quote import quote
from shipping.rates import load_rates

RATES = {"domestic": {"standard": 4.5}, "eu": {"standard": 8.9}}


def test_first_kilo_is_base_rate():
    assert quote("domestic", 1.0, rates=RATES) == 4.5


def test_extra_weight_is_charged_per_kilo():
    assert quote("eu", 3.0, rates=RATES) == 11.4


def test_rate_table_has_domestic_zone():
    assert "domestic" in load_rates()
