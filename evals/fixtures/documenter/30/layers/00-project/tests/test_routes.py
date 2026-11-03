import json

from records.app import create_app
from records.auth import User
from records.http import Request

VIEWER = User(3, "Vik", "viewer")


def get(path, query=None, user=VIEWER):
    return Request("GET", path, query or {}, user)


def ids(response):
    return [record["id"] for record in json.loads(response.body)["records"]]


def test_get_records_lists_the_seed_records_for_any_signed_in_role():
    response = create_app().handle(get("/records"))
    assert response.status == 200
    assert response.headers["content-type"] == "application/json; charset=utf-8"
    assert json.loads(response.body)["count"] == 6
    assert ids(response) == [1, 2, 3, 4, 5, 6]


def test_get_records_applies_status_and_owner_filters():
    response = create_app().handle(get("/records", {"status": "active", "owner": "marco"}))
    assert ids(response) == [4, 6]


def test_get_records_searches_titles():
    response = create_app().handle(get("/records", {"q": "REVIEW"}))
    assert ids(response) == [3]


def test_get_records_rejects_an_unknown_status_with_400():
    response = create_app().handle(get("/records", {"status": "deleted"}))
    assert response.status == 400
    assert json.loads(response.body) == {"error": "unknown status: deleted"}


def test_get_records_requires_a_signed_in_user():
    assert create_app().handle(get("/records", user=None)).status == 401


def test_unknown_paths_return_404():
    assert create_app().handle(get("/reports")).status == 404
