import logging

from fastapi import Depends, Header, HTTPException, status

from app.auth.client import AuthRejected, AuthUnavailable, InternalAuthClient, get_auth_client
from app.auth.tokens import token_fingerprint

logger = logging.getLogger(__name__)


def require_user(
    authorization: str = Header(default=""),
    client: InternalAuthClient = Depends(get_auth_client),
) -> dict:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        claims = client.introspect(token)
    except AuthRejected:
        logger.info("Token rejected fingerprint=%s", token_fingerprint(token))
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from None
    except AuthUnavailable:
        logger.warning("Auth service unavailable during introspection")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Auth service unavailable") from None
    return claims
