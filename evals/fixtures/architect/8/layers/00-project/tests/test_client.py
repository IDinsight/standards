import io
import json

from ledgerctl.client import LedgerClient


def test_client_sends_bearer_token():
    seen = {}

    def opener(request, timeout):
        seen["auth"] = request.get_header("Authorization")
        seen["url"] = request.full_url
        return io.BytesIO(json.dumps({"email": "ada@example.com"}).encode())

    client = LedgerClient("https://api.example.test/", "tok-1", opener=opener)
    assert client.whoami() == {"email": "ada@example.com"}
    assert seen == {"auth": "Bearer tok-1", "url": "https://api.example.test/v1/me"}
