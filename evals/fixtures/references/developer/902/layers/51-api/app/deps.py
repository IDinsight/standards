from fastapi import Header, HTTPException, status


def current_user_id(x_user_id: str | None = Header(default=None)) -> str:
    """Return the caller's id, asserted by the gateway in front of the service."""
    if not x_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing user")
    return x_user_id
