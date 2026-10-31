import random
import time


class TransientError(Exception):
    """An error worth retrying, such as a timeout or a 503 response."""


def backoff_delay(attempt, base_delay=0.5, max_delay=8.0):
    """Seconds to wait after the given 1-based attempt fails."""
    return min(max_delay, base_delay * 2 ** (attempt - 1))


def retry(fn, attempts=4, base_delay=0.5, max_delay=8.0, sleep=time.sleep, jitter=random.random):
    """Call fn until it succeeds or the attempts run out.

    Only TransientError is retried; any other exception propagates at once.
    The final TransientError is re-raised when every attempt fails.
    """
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except TransientError:
            if attempt == attempts:
                raise
            delay = backoff_delay(attempt, base_delay, max_delay)
            sleep(delay * (0.5 + jitter() / 2))
