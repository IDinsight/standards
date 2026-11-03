"""Counters with expiry, with the semantics of Redis INCR, EXPIRE, and TTL."""

import math
import time
from collections.abc import Callable
from typing import Protocol


class CounterStoreError(Exception):
    """Raised by every CounterStore method when the backing store fails."""


class CounterStore(Protocol):
    def get(self, key: str) -> int:
        """Return the count, or 0 when the key is missing or expired."""
        ...

    def incr(self, key: str) -> int:
        """Add one and return the new count. A new key starts at 1 with no expiry."""
        ...

    def expire(self, key: str, seconds: int) -> None:
        """Make the key expire after the given number of seconds."""
        ...

    def ttl(self, key: str) -> int:
        """Return the seconds left: -1 when the key has no expiry, -2 when it is missing."""
        ...

    def delete(self, key: str) -> None:
        """Remove the key."""
        ...


class InMemoryCounterStore:
    """CounterStore kept in process memory, with expiry measured by `clock`."""

    def __init__(self, clock: Callable[[], float] = time.monotonic) -> None:
        self._clock = clock
        self._counts: dict[str, int] = {}
        self._deadlines: dict[str, float] = {}

    def _drop_if_expired(self, key: str) -> None:
        deadline = self._deadlines.get(key)
        if deadline is not None and self._clock() >= deadline:
            self._counts.pop(key, None)
            self._deadlines.pop(key, None)

    def get(self, key: str) -> int:
        self._drop_if_expired(key)
        return self._counts.get(key, 0)

    def incr(self, key: str) -> int:
        self._drop_if_expired(key)
        count = self._counts.get(key, 0) + 1
        self._counts[key] = count
        return count

    def expire(self, key: str, seconds: int) -> None:
        self._drop_if_expired(key)
        if key in self._counts:
            self._deadlines[key] = self._clock() + seconds

    def ttl(self, key: str) -> int:
        self._drop_if_expired(key)
        if key not in self._counts:
            return -2
        deadline = self._deadlines.get(key)
        if deadline is None:
            return -1
        return math.ceil(deadline - self._clock())

    def delete(self, key: str) -> None:
        self._counts.pop(key, None)
        self._deadlines.pop(key, None)


class RedisCounterStore:
    """CounterStore backed by Redis."""

    def __init__(self, url: str) -> None:
        import redis

        self._errors = redis.exceptions.RedisError
        self._client = redis.Redis.from_url(url, socket_timeout=1.0, socket_connect_timeout=1.0)

    def _run(self, command: str, *args: object) -> object:
        try:
            return getattr(self._client, command)(*args)
        except self._errors as exc:
            raise CounterStoreError(f"counter store {command} failed") from exc

    def get(self, key: str) -> int:
        value = self._run("get", key)
        return 0 if value is None else int(value)

    def incr(self, key: str) -> int:
        return int(self._run("incr", key))

    def expire(self, key: str, seconds: int) -> None:
        self._run("expire", key, seconds)

    def ttl(self, key: str) -> int:
        return int(self._run("ttl", key))

    def delete(self, key: str) -> None:
        self._run("delete", key)
