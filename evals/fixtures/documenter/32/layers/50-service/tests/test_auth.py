import pytest

from recordsvc.auth import HttpError, User, authorize, require_admin

ADMIN = User(1, "Ada", "admin")
EDITOR = User(2, "Eli", "editor")
VIEWER = User(3, "Vik", "viewer")


def test_authorize_rejects_a_request_without_a_user():
    with pytest.raises(HttpError) as raised:
        authorize(None, ("viewer",))
    assert raised.value.status == 401


def test_authorize_rejects_a_role_that_is_not_allowed():
    with pytest.raises(HttpError) as raised:
        authorize(VIEWER, ("admin", "editor"))
    assert raised.value.status == 403


def test_require_admin_returns_the_admin():
    assert require_admin(ADMIN) is ADMIN


def test_require_admin_rejects_an_editor():
    with pytest.raises(HttpError) as raised:
        require_admin(EDITOR)
    assert raised.value.status == 403
