import pytest

from records.auth import User, authorize, require_admin
from records.errors import HttpError

ADMIN = User(1, "Ada", "admin")
VIEWER = User(3, "Vik", "viewer")


def status_of(call):
    with pytest.raises(HttpError) as raised:
        call()
    return raised.value.status


def test_authorize_rejects_a_request_without_a_user():
    assert status_of(lambda: authorize(None, ("viewer",))) == 401


def test_authorize_rejects_a_role_that_is_not_allowed():
    assert status_of(lambda: authorize(VIEWER, ("admin", "editor"))) == 403


def test_require_admin_returns_the_admin_user():
    assert require_admin(ADMIN) is ADMIN


def test_require_admin_rejects_other_roles():
    assert status_of(lambda: require_admin(VIEWER)) == 403
