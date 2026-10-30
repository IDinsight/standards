from fxrates.cache import RateCache
from fxrates.provider import fetch_rate


class Converter:
    def __init__(self, fetch=fetch_rate, cache=None):
        self._fetch = fetch
        self._cache = cache if cache is not None else RateCache()

    def rate(self, base, quote):
        base, quote = base.upper(), quote.upper()
        if base == quote:
            return 1.0
        pair = (base, quote)
        cached = self._cache.get(pair)
        if cached is not None:
            return cached
        value = self._fetch(base, quote)
        self._cache.put(pair, value)
        return value

    def convert(self, amount, base, quote):
        return amount * self.rate(base, quote)
