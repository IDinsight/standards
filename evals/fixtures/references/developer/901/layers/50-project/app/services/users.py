"""Users and the repository interface the services read them through."""

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class User:
    id: int
    email: str
    password_hash: str


class UserRepository(Protocol):
    def get_by_email(self, email: str) -> User | None:
        """Return the user with this email address, or None."""
        ...


class InMemoryUserRepository:
    """UserRepository backed by a dict, for tests and local tools."""

    def __init__(self, users: Iterable[User] = ()) -> None:
        self._by_email = {user.email.strip().lower(): user for user in users}

    def get_by_email(self, email: str) -> User | None:
        return self._by_email.get(email.strip().lower())
