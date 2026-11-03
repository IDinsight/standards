import json

from recordsvc.api import App
from recordsvc.auth import User

VIEWER = User(3, "Vik", "viewer")


def get(app, query=None, user=VIEWER, path="/records"):
    return app.handle("GET", path, user, query or {})


def record_ids(body):
    return [record["id"] for record in json.loads(body)["records"]]


def test_lists_seeded_records_for_any_signed_in_role():
    status, headers, body = get(App())
    assert status == 200
    assert headers["content-type"] == "application/json; charset=utf-8"
    assert json.loads(body)["count"] == 6
    assert record_ids(body) == [1, 2, 3, 4, 5, 6]


def test_applies_status_and_owner_filters():
    _, _, body = get(App(), {"status": "active", "owner": "marco"})
    assert record_ids(body) == [4, 6]


def test_rejects_an_unknown_status():
    status, _, body = get(App(), {"status": "deleted"})
    assert status == 400
    assert json.loads(body) == {"error": "unknown status: deleted"}


def test_requires_a_signed_in_user():
    status, _, _ = get(App(), user=None)
    assert status == 401


def test_unknown_path_returns_404():
    status, _, _ = get(App(), path="/reports")
    assert status == 404


def test_wrong_method_returns_405():
    status, _, _ = App().handle("POST", "/records", VIEWER, {})
    assert status == 405
