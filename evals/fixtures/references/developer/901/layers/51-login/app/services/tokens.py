"""Signed access tokens."""

import base64
import hashlib
import hmac
import json
import time


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _sign(body: str, secret: str) -> str:
    return _b64(hmac.new(secret.encode(), body.encode(), hashlib.sha256).digest())


def issue_token(user_id: int, *, secret: str, ttl_seconds: int, now: float | None = None) -> str:
    issued_at = int(time.time() if now is None else now)
    payload = json.dumps({"sub": user_id, "exp": issued_at + ttl_seconds}, separators=(",", ":"))
    body = _b64(payload.encode())
    return f"{body}.{_sign(body, secret)}"


def read_token(token: str, *, secret: str, now: float | None = None) -> int | None:
    """Return the user id of a valid, unexpired token, or None."""
    try:
        body, signature = token.split(".")
    except ValueError:
        return None
    if not hmac.compare_digest(signature, _sign(body, secret)):
        return None
    payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
    current = time.time() if now is None else now
    if payload["exp"] <= current:
        return None
    return int(payload["sub"])
