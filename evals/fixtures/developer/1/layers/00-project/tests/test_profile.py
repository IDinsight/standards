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
