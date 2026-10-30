from fxrates.cache import RateCache
from fxrates.convert import Converter


class FakeClock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


def test_entry_expires_after_ttl():
    clock = FakeClock()
    cache = RateCache(ttl=300, clock=clock)
    cache.put(("USD", "EUR"), 0.9)
    clock.now = 299
    assert cache.get(("USD", "EUR")) == 0.9
    clock.now = 300
    assert cache.get(("USD", "EUR")) is None


def test_least_recently_used_entry_is_evicted():
    cache = RateCache(max_entries=2, clock=FakeClock())
    cache.put(("USD", "EUR"), 0.9)
    cache.put(("USD", "GBP"), 0.8)
    cache.get(("USD", "EUR"))
    cache.put(("USD", "JPY"), 150.0)
    assert cache.get(("USD", "GBP")) is None
    assert cache.get(("USD", "EUR")) == 0.9
    assert len(cache) == 2


def test_converter_fetches_again_after_ttl():
    clock = FakeClock()
    calls = []

    def fetch(base, quote):
        calls.append((base, quote))
        return 0.5

    conv = Converter(fetch=fetch, cache=RateCache(ttl=300, clock=clock))
    conv.rate("USD", "EUR")
    clock.now = 301
    conv.rate("USD", "EUR")
    assert len(calls) == 2
