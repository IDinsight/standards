import pytest

from notifier.config import Config
from notifier.sender import DeliveryError, send_with_retry

CONFIG = Config(webhook_url="http://hooks.test/x", timeout=1.0, max_attempts=3, backoff=0.5)


def scripted(statuses):
    calls = []

    def post(url, payload, timeout):
        calls.append((url, payload, timeout))
        return statuses[len(calls) - 1]

    return post, calls


def test_retries_retryable_status_then_succeeds():
    post, calls = scripted([503, 200])
    sleeps = []
    assert send_with_retry(CONFIG, {"text": "hi"}, post=post, sleep=sleeps.append) == 2
    assert sleeps == [0.5]
    assert calls[0] == ("http://hooks.test/x", {"text": "hi"}, 1.0)


def test_gives_up_after_max_attempts():
    post, calls = scripted([503, 503, 503])
    sleeps = []
    with pytest.raises(DeliveryError):
        send_with_retry(CONFIG, {"text": "hi"}, post=post, sleep=sleeps.append)
    assert len(calls) == 3
    assert sleeps == [0.5, 1.0]


def test_client_error_is_not_retried():
    post, calls = scripted([400])
    sleeps = []
    with pytest.raises(DeliveryError):
        send_with_retry(CONFIG, {"text": "hi"}, post=post, sleep=sleeps.append)
    assert len(calls) == 1
    assert sleeps == []
