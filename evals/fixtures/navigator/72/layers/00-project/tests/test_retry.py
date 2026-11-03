import pytest

from syncer.client import PermanentError, get_json
from syncer.retry import TransientError, backoff_delay, retry


def no_sleep(seconds):
    pass


def failing(times, error=TransientError):
    calls = []

    def fn():
        calls.append(1)
        if len(calls) <= times:
            raise error("boom")
        return "ok"

    return fn, calls


def test_returns_after_transient_failures():
    fn, calls = failing(2)
    assert retry(fn, sleep=no_sleep) == "ok"
    assert len(calls) == 3


def test_gives_up_after_all_attempts():
    fn, calls = failing(10)
    with pytest.raises(TransientError):
        retry(fn, sleep=no_sleep)
    assert len(calls) == 4


def test_other_errors_are_not_retried():
    fn, calls = failing(1, error=ValueError)
    with pytest.raises(ValueError):
        retry(fn, sleep=no_sleep)
    assert len(calls) == 1


def test_backoff_doubles_up_to_the_cap():
    assert [backoff_delay(n) for n in range(1, 7)] == [0.5, 1.0, 2.0, 4.0, 8.0, 8.0]


def test_jitter_keeps_delay_between_half_and_full():
    waits = []
    retry(failing(1)[0], sleep=waits.append, jitter=lambda: 0.0)
    retry(failing(1)[0], sleep=waits.append, jitter=lambda: 0.999)
    assert waits[0] == 0.25
    assert 0.49 < waits[1] < 0.5


def test_get_json_retries_unavailable_then_succeeds():
    responses = iter([(503, None), (200, {"items": []})])
    assert get_json(lambda path: next(responses), "/contacts", sleep=no_sleep) == {"items": []}


def test_get_json_does_not_retry_not_found():
    seen = []

    def transport(path):
        seen.append(path)
        return 404, None

    with pytest.raises(PermanentError):
        get_json(transport, "/missing", sleep=no_sleep)
    assert seen == ["/missing"]
