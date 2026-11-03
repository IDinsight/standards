import time


class RetryError(Exception):
    """Raised when every attempt failed with a retryable error."""

    def __init__(self, attempts, last_error):
        super().__init__(f"gave up after {attempts} attempts: {last_error}")
        self.attempts = attempts
        self.last_error = last_error


def backoff_delays(attempts, base=0.5, cap=8.0):
    """Seconds to wait before each retry: base, 2*base, 4*base, ..., at most cap."""
    return [min(cap, base * 2 ** i) for i in range(attempts - 1)]


def call_with_retry(fn, attempts=4, base=0.5, cap=8.0,
                    retry_on=(ConnectionError, TimeoutError), sleep=time.sleep):
    """Call fn until it succeeds, retrying only errors listed in retry_on."""
    if attempts < 1:
        raise ValueError("attempts must be at least 1")
    delays = backoff_delays(attempts, base, cap)
    for attempt in range(attempts):
        try:
            return fn()
        except retry_on as exc:
            if attempt == attempts - 1:
                raise RetryError(attempts, exc) from exc
            sleep(delays[attempt])
