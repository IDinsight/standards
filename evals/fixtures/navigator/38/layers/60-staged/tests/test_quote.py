import pytest

from shipping.quote import quote
from shipping.rates import load_rates

RATES = {
    "domestic": {"standard": 4.5, "express": 9.0},
    "eu": {"standard": 8.9, "express": 16.5},
}


def test_first_kilo_is_base_rate():
    assert quote("domestic", 1.0, rates=RATES) == 4.5


def test_extra_weight_is_charged_per_kilo():
    assert quote("eu", 3.0, rates=RATES) == 11.4


def test_express_tier():
    assert quote("domestic", 2.0, tier="express", rates=RATES) == 10.25


def test_unknown_tier_is_rejected():
    with pytest.raises(ValueError):
        quote("domestic", tier="overnight", rates=RATES)


def test_rate_table_has_domestic_zone():
    assert "domestic" in load_rates()


def test_rate_table_lists_both_tiers():
    assert all(set(prices) == {"standard", "express"} for prices in load_rates().values())
