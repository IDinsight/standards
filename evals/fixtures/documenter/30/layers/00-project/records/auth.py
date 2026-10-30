"""Roles and the server-side role check used by route handlers."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from records.errors import HttpError

Role = Literal["admin", "editor", "viewer"]
ROLES: tuple[Role, ...] = ("admin", "editor", "viewer")


@dataclass(frozen=True)
class User:
    id: int
    name: str
    role: Role


def authorize(user: User | None, allowed: tuple[Role, ...]) -> User:
    """Return ``user`` if its role is in ``allowed``.

    Raises HttpError(401) when there is no signed-in user and HttpError(403)
    when the user's role is not allowed.
    """
    if user is None:
        raise HttpError(401, "authentication required")
    if user.role not in allowed:
        raise HttpError(403, "forbidden")
    return user


def require_admin(user: User | None) -> User:
    return authorize(user, ("admin",))
