from app.api import get_profile, put_profile
from app.service import ProfileService
from app.store import ProfileStore


def test_round_trip():
    service = ProfileService(ProfileStore())
    assert put_profile(service, 1, {"display_name": " Ada ", "email": "ADA@x.org"})[0] == 200
    assert get_profile(service, 1) == (200, {"user_id": 1, "display_name": "Ada", "email": "ada@x.org"})
