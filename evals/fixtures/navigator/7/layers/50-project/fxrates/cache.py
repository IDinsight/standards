"""In-memory cache for exchange rates."""


class RateCache:
    def __init__(self):
        self._rates = {}

    def get(self, pair):
        return self._rates.get(pair)

    def put(self, pair, rate):
        self._rates[pair] = rate

    def clear(self):
        self._rates.clear()
