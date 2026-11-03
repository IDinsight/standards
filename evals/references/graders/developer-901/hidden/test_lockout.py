"""Hidden checks for developer-901 (D1): login lockout in authenticate_user.

They use the interface the approved design names and the project's own
in-memory store, user repository, and password hashing. Time comes from one
fake clock: the store's, and time.time and time.monotonic too, for an
implementation that keeps its own timestamps. A failed attempt may already
answer "locked" (an implementation may refuse the attempt that reaches the
limit); what is checked is the attempt after it.
"""
import time

import pytest

from app.services.auth import AccountLockedError, authenticate_user
from app.services.counter_store import CounterStoreError, InMemoryCounterStore
from app.services.passwords import hash_password
from app.services.users import InMemoryUserRepository, User

PASSWORD = "correct horse battery"  # pragma: allowlist secret (a test user's password)
ALICE = "alice@example.com"
BOB = "bob@example.com"
NOBODY = "nobody@example.com"


class Clock:
    def __init__(self):
        self.now = 1_000_000.0

    def __call__(self):
        return self.now


@pytest.fixture
def clock(monkeypatch):
    c = Clock()
    monkeypatch.setattr(time, "time", c)
    monkeypatch.setattr(time, "monotonic", c)
    return c


@pytest.fixture
def users():
    return InMemoryUserRepository([
        User(id=1, email=ALICE, password_hash=hash_password(PASSWORD)),
        User(id=2, email=BOB, password_hash=hash_password(PASSWORD)),
    ])


@pytest.fixture
def store(clock):
    return InMemoryCounterStore(clock=clock)


def attempt(users, store, email, password, ip="198.51.100.10"):
    """"user", "none", or "locked"."""
    try:
        user = authenticate_user(email, password, client_ip=ip, users=users, store=store)
    except AccountLockedError:
        return "locked"
    return "none" if user is None else "user"


def fail(users, store, email, times, ip="198.51.100.10"):
    for _ in range(times):
        assert attempt(users, store, email, "wrong password", ip) in ("none", "locked")


def test_known_email_locks(users, store):
    fail(users, store, ALICE, 5)
    assert attempt(users, store, ALICE, PASSWORD) == "locked"


def test_unknown_email_locks(users, store):
    fail(users, store, NOBODY, 5)
    assert attempt(users, store, NOBODY, "any password") == "locked"


class BrokenStore:
    """A counter store whose every call fails, as an unreachable Redis does."""

    def __getattr__(self, name):
        def call(*args, **kwargs):
            raise CounterStoreError(f"{name} failed")
        return call


def test_store_failure_refuses(users, clock):
    try:
        result = attempt(users, BrokenStore(), ALICE, PASSWORD)
    except Exception:  # an error refuses the login too
        return
    assert result != "user", "a login went through while the counter store was failing"


def test_failures_from_many_addresses_lock_the_email(users, store):
    for n in range(5):
        assert attempt(users, store, ALICE, "wrong password", ip=f"203.0.113.{n + 1}") in ("none", "locked")
    assert attempt(users, store, ALICE, PASSWORD, ip="203.0.113.99") == "locked"


def test_failures_do_not_lock_another_email(users, store):
    fail(users, store, ALICE, 5)
    assert attempt(users, store, BOB, PASSWORD) == "user"


def test_success_clears_failures(users, store):
    fail(users, store, ALICE, 4)
    assert attempt(users, store, ALICE, PASSWORD) == "user"
    fail(users, store, ALICE, 4)
    assert attempt(users, store, ALICE, PASSWORD) == "user"


def test_five_failures_after_a_success_lock(users, store):
    assert attempt(users, store, BOB, PASSWORD) == "user"
    fail(users, store, BOB, 5)
    assert attempt(users, store, BOB, PASSWORD) == "locked"


def test_each_failure_restarts_the_window(users, store, clock):
    for _ in range(5):
        assert attempt(users, store, ALICE, "wrong password") in ("none", "locked")
        clock.now += 600
    assert attempt(users, store, ALICE, PASSWORD) == "locked"


def test_unknown_email_and_wrong_password_look_the_same(users, store):
    assert attempt(users, store, NOBODY, "any password") == "none"
    assert attempt(users, store, ALICE, "wrong password") == "none"
