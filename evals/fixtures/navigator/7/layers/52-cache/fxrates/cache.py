"""In-memory cache for exchange rates."""

import time
from collections import OrderedDict

DEFAULT_TTL_SECONDS = 300
DEFAULT_MAX_ENTRIES = 256


class RateCache:
    def __init__(self, ttl=DEFAULT_TTL_SECONDS, max_entries=DEFAULT_MAX_ENTRIES, clock=time.monotonic):
        self.ttl = ttl
        self.max_entries = max_entries
        self._clock = clock
        self._entries = OrderedDict()

    def get(self, pair):
        entry = self._entries.get(pair)
        if entry is None:
            return None
        rate, stored_at = entry
        if self._clock() - stored_at >= self.ttl:
            del self._entries[pair]
            return None
        self._entries.move_to_end(pair)
        return rate

    def put(self, pair, rate):
        self._entries[pair] = (rate, self._clock())
        self._entries.move_to_end(pair)
        while len(self._entries) > self.max_entries:
            self._entries.popitem(last=False)

    def clear(self):
        self._entries.clear()

    def __len__(self):
        return len(self._entries)
