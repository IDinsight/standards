import urllib.error

import pytest

from app.auth.client import AuthRejected, AuthUnavailable, InternalAuthClient, TokenPair
from tests.fakes import FakeAuthTransport


def make_client(*responses):
    transport = FakeAuthTransport(responses)
    return InternalAuthClient("http://auth.test/", "svc-key", transport=transport), transport


def test_refresh_returns_new_token_pair():
    client, transport = make_client(
        (200, {"access_token": "acc-2", "refresh_token": "ref-2", "expires_in": 900})
    )
    assert client.refresh("ref-1") == TokenPair("acc-2", "ref-2", 900)
    assert transport.calls[0]["url"] == "http://auth.test/v1/token/refresh"
    assert transport.calls[0]["payload"] == {"refresh_token": "ref-1"}


def test_refused_refresh_token_raises_rejected():
    client, _ = make_client((401, {"error": "invalid_grant"}))
    with pytest.raises(AuthRejected):
        client.refresh("ref-1")


def test_server_error_raises_unavailable():
    client, _ = make_client((502, {}))
    with pytest.raises(AuthUnavailable):
        client.refresh("ref-1")


def test_connection_error_raises_unavailable():
    client, _ = make_client(urllib.error.URLError("timed out"))
    with pytest.raises(AuthUnavailable):
        client.introspect("acc-1")


def test_inactive_token_is_rejected():
    client, _ = make_client((200, {"active": False}))
    with pytest.raises(AuthRejected):
        client.introspect("acc-1")


def test_service_key_is_sent():
    client, transport = make_client((200, {"active": True, "sub": "u-1"}))
    assert client.introspect("acc-1")["sub"] == "u-1"
    assert transport.calls[0]["headers"]["Authorization"] == "Service svc-key"
