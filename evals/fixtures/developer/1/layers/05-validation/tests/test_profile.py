from app.api import get_profile, put_profile
from app.service import ProfileService
from app.store import ProfileStore


def make_service():
    return ProfileService(ProfileStore())


def test_round_trip_normalizes_input():
    service = make_service()
    status, _ = put_profile(service, 1, {"display_name": " Ada ", "email": "ADA@x.org"})
    assert status == 200
    assert get_profile(service, 1) == (
        200,
        {"user_id": 1, "display_name": "Ada", "email": "ada@x.org"},
    )


def test_unknown_profile_is_404():
    assert get_profile(make_service(), 99) == (404, {"error": "not found"})


def test_invalid_email_is_rejected_and_profile_kept():
    service = make_service()
    put_profile(service, 1, {"display_name": "Ada", "email": "ada@x.org"})
    status, body = put_profile(service, 1, {"display_name": "Ada", "email": "nope"})
    assert status == 400
    assert "email" in body["error"]
    assert get_profile(service, 1)[1]["email"] == "ada@x.org"


def test_missing_field_is_400():
    status, body = put_profile(make_service(), 1, {"display_name": "Ada"})
    assert status == 400
    assert body == {"error": "missing field: email"}
