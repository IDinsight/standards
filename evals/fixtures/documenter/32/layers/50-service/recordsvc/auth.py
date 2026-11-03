"""Users, roles, and server-side authorization for handlers."""

from dataclasses import dataclass

__all__ = ["HttpError", "User", "authorize", "require_admin"]

ROLES = ("admin", "editor", "viewer")


class HttpError(Exception):
    """An error a handler turns into an HTTP status and a JSON `{"error": ...}` body."""

    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


@dataclass(frozen=True)
class User:
    """A signed-in user with a `role` of `admin`, `editor`, or `viewer`."""

    id: int
    name: str
    role: str


def authorize(user, allowed):
    """Return `user` when its role is in `allowed`.

    Raises `HttpError(401)` when `user` is `None` and `HttpError(403)` when the
    role is not allowed.
    """
    if user is None:
        raise HttpError(401, "authentication required")
    if user.role not in allowed:
        raise HttpError(403, "forbidden")
    return user


def require_admin(user):
    """Return `user` if it is an administrator; see `authorize`.

    Not used by any handler yet; kept for admin-only handlers.
    """
    return authorize(user, ("admin",))
