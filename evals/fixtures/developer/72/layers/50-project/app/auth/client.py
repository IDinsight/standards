"""Client for the internal auth service."""

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from functools import lru_cache
from typing import Callable

from app.config import settings

Transport = Callable[[str, bytes, dict[str, str], float], tuple[int, dict]]


class AuthRejected(Exception):
    """The auth service refused the token."""


class AuthUnavailable(Exception):
    """The auth service could not be reached or returned a server error."""


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str
    expires_in: int


def urllib_transport(url: str, data: bytes, headers: dict[str, str], timeout: float) -> tuple[int, dict]:
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, json.loads(response.read() or b"{}")
    except urllib.error.HTTPError as exc:
        body = exc.read()
        try:
            return exc.code, json.loads(body or b"{}")
        except ValueError:
            return exc.code, {}


class InternalAuthClient:
    def __init__(
        self,
        base_url: str,
        service_key: str,
        timeout: float = 3.0,
        transport: Transport | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._service_key = service_key
        self._timeout = timeout
        self._transport = transport or urllib_transport

    def introspect(self, access_token: str) -> dict:
        body = self._post("/v1/introspect", {"token": access_token})
        if not body.get("active"):
            raise AuthRejected("inactive token")
        return body

    def refresh(self, refresh_token: str) -> TokenPair:
        body = self._post("/v1/token/refresh", {"refresh_token": refresh_token})
        return TokenPair(body["access_token"], body["refresh_token"], int(body["expires_in"]))

    def _post(self, path: str, payload: dict) -> dict:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Service {self._service_key}",
        }
        data = json.dumps(payload).encode()
        try:
            status, body = self._transport(self._base_url + path, data, headers, self._timeout)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            raise AuthUnavailable(path) from exc
        if status >= 500:
            raise AuthUnavailable(f"{path} returned {status}")
        if status >= 400:
            raise AuthRejected(body.get("error", f"status {status}"))
        return body


@lru_cache(maxsize=1)
def get_auth_client() -> InternalAuthClient:
    return InternalAuthClient(
        settings.auth_base_url,
        settings.auth_service_key,
        timeout=settings.auth_timeout_seconds,
    )
