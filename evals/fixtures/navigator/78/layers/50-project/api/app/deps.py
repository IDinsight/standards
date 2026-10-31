"""FastAPI dependencies shared by the routers."""

import sqlite3
from functools import lru_cache

from fastapi import Depends, Header, HTTPException, status

from app.auth import AuthError, authenticate
from app.config import load_settings
from app.persistence.db import connect
from app.persistence.repository import ApiKey, Repository


@lru_cache
def get_connection() -> sqlite3.Connection:
    return connect(load_settings().database_path)


def get_repository(conn: sqlite3.Connection = Depends(get_connection)) -> Repository:
    return Repository(conn)


def require_api_key(
    authorization: str | None = Header(default=None),
    repo: Repository = Depends(get_repository),
) -> ApiKey:
    try:
        return authenticate(authorization, repo)
    except AuthError as exc:
        print(f"auth rejected: {exc.reason}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
