import io
import json

import pytest

import client
import config


def make_opener(body, seen):
    def opener(url, timeout):
        seen.append((url, timeout))
        return io.BytesIO(json.dumps(body).encode())

    return opener


def test_returns_rates_for_base():
    seen = []
    rates = client.fetch_rates("USD", opener=make_opener({"rates": {"EUR": 0.9}}, seen))
    assert rates == {"EUR": 0.9}
    assert seen[0][0].endswith("?base=USD")


def test_passes_configured_timeout():
    seen = []
    client.fetch_rates(opener=make_opener({"rates": {}}, seen))
    assert seen[0][1] == config.REQUEST_TIMEOUT_SECONDS


def test_timeout_raises_provider_timeout():
    def opener(url, timeout):
        raise TimeoutError()

    with pytest.raises(client.ProviderTimeout):
        client.fetch_rates(opener=opener)
