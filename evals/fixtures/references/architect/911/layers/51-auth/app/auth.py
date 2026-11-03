from fastapi import Header, HTTPException, status

from app.config import settings


def require_token(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        print("auth: missing bearer token")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing token")
    token = authorization.removeprefix("Bearer ")
    if token not in settings.token_set:
        print("auth: invalid token")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token")
