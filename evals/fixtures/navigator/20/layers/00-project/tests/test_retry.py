import pytest

from syncer.client import SyncClient
from syncer.retry import RetryError, backoff_delays, call_with_retry


def test_backoff_doubles_and_caps():
    assert backoff_delays(4) == [0.5, 1.0, 2.0]
    assert backoff_delays(7, base=1.0, cap=8.0) == [1.0, 2.0, 4.0, 8.0, 8.0, 8.0]


def test_gives_up_after_all_attempts():
    calls, waits = [], []

    def failing():
        calls.append(1)
        raise ConnectionError("refused")

    with pytest.raises(RetryError) as info:
        call_with_retry(failing, attempts=3, sleep=waits.append)
    assert len(calls) == 3
    assert waits == [0.5, 1.0]
    assert info.value.attempts == 3


def test_other_errors_are_not_retried():
    calls = []

    def broken():
        calls.append(1)
        raise KeyError("since")

    with pytest.raises(KeyError):
        call_with_retry(broken, sleep=lambda _: None)
    assert len(calls) == 1


class FlakyTransport:
    def __init__(self, failures):
        self.failures = failures

    def get(self, path, params):
        if self.failures:
            self.failures -= 1
            raise TimeoutError("slow")
        return {"changes": [{"id": 1, "after": params["since"]}]}


def test_pull_recovers_from_timeouts():
    client = SyncClient(FlakyTransport(failures=2), sleep=lambda _: None)
    assert client.pull("c-10") == [{"id": 1, "after": "c-10"}]
