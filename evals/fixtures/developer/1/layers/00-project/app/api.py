from app.service import ProfileService


def _body(profile):
    return {
        "user_id": profile.user_id,
        "display_name": profile.display_name,
        "email": profile.email,
    }


def get_profile(service: ProfileService, user_id: int):
    profile = service.get_profile(user_id)
    if profile is None:
        return 404, {"error": "not found"}
    return 200, _body(profile)


def put_profile(service: ProfileService, user_id: int, body: dict):
    profile = service.update_profile(user_id, body["display_name"], body["email"])
    return 200, _body(profile)
