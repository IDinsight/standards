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
    try:
        profile = service.update_profile(user_id, body["display_name"], body["email"])
    except KeyError as exc:
        return 400, {"error": f"missing field: {exc.args[0]}"}
    except ValueError as exc:
        return 400, {"error": str(exc)}
    return 200, _body(profile)
