from fxrates.convert import Converter


def make(rates):
    calls = []

    def fetch(base, quote):
        calls.append((base, quote))
        return rates[(base, quote)]

    return Converter(fetch=fetch), calls


def test_same_currency_is_one():
    conv, calls = make({})
    assert conv.rate("usd", "USD") == 1.0
    assert calls == []


def test_converts_amount():
    conv, _ = make({("USD", "EUR"): 0.5})
    assert conv.convert(10, "usd", "eur") == 5.0


def test_rate_is_cached():
    conv, calls = make({("USD", "EUR"): 0.5})
    conv.rate("USD", "EUR")
    conv.rate("USD", "EUR")
    assert calls == [("USD", "EUR")]
