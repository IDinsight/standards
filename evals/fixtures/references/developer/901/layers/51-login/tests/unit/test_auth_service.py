import pytest

from app.services.auth import authenticate_user
from app.services.passwords import hash_password
from app.services.users import InMemoryUserRepository, User


@pytest.fixture
def users():
    return InMemoryUserRepository(
        [User(id=1, email="ada@example.org", password_hash=hash_password("analytical-engine"))]
    )


def login(email, password, users):
    return authenticate_user(email, password, client_ip="203.0.113.7", users=users)


def test_correct_password_returns_user(users):
    user = login("ada@example.org", "analytical-engine", users)
    assert user is not None
    assert user.id == 1


def test_wrong_password_returns_none(users):
    assert login("ada@example.org", "difference-engine", users) is None


def test_unknown_email_returns_none(users):
    assert login("grace@example.org", "analytical-engine", users) is None
