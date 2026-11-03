import hashlib

from fastapi import Header, HTTPException, Request, status


def _unauthorized() -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid or missing bearer token",
                         headers={"WWW-Authenticate": "Bearer"})


def require_token(request: Request, authorization: str | None = Header(default=None)) -> str:
    """Return the name of the API token sent as `Authorization: Bearer <token>`."""
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _unauthorized()
    digest = hashlib.sha256(token.encode()).hexdigest()
    row = request.app.state.db.execute("SELECT name FROM api_tokens WHERE token_sha256 = ?", (digest,)).fetchone()
    if row is None:
        raise _unauthorized()
    return row[0]
