"""HTTP client for the Ledger reporting API."""

import json
import urllib.error
import urllib.request


class ApiError(Exception):
    """The API could not be reached or answered with an error."""


class LedgerClient:
    def __init__(self, base_url, token, opener=None):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self._open = opener or urllib.request.urlopen

    def _get(self, path):
        request = urllib.request.Request(
            self.base_url + path,
            headers={"Authorization": f"Bearer {self.token}", "Accept": "application/json"},
        )
        try:
            with self._open(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            raise ApiError(f"{exc.code} {exc.reason}") from exc
        except urllib.error.URLError as exc:
            raise ApiError(str(exc.reason)) from exc

    def whoami(self):
        return self._get("/v1/me")

    def balances(self):
        return self._get("/v1/balances")["balances"]
