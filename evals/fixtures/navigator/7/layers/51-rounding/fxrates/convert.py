from decimal import ROUND_HALF_EVEN, ROUND_HALF_UP, Decimal

from fxrates.cache import RateCache
from fxrates.provider import fetch_rate

ROUNDING = {"half_even": ROUND_HALF_EVEN, "half_up": ROUND_HALF_UP}


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

    def convert(self, amount, base, quote, places=2, rounding="half_even"):
        value = Decimal(str(amount)) * Decimal(str(self.rate(base, quote)))
        step = Decimal(1).scaleb(-places)
        return float(value.quantize(step, rounding=ROUNDING[rounding]))
