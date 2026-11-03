"""API key authentication, independent of the web framework."""

import hashlib

from app.persistence.repository import ApiKey, Repository


class AuthError(Exception):
    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


def hash_key(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def authenticate(authorization: str | None, repo: Repository) -> ApiKey:
    if not authorization:
        raise AuthError("missing credentials")
    scheme, _, token = authorization.partition(" ")
    token = token.strip()
    if scheme.lower() != "bearer" or not token:
        raise AuthError("malformed credentials")
    key = repo.api_key_by_hash(hash_key(token))
    if key is None:
        raise AuthError("unknown key")
    if key.revoked:
        raise AuthError("revoked key")
    return key
