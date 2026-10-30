from app.models import Profile

MAX_DISPLAY_NAME = 64


class ProfileService:
    def __init__(self, store):
        self.store = store

    def get_profile(self, user_id):
        return self.store.get(user_id)

    def update_profile(self, user_id, display_name, email):
        display_name = display_name.strip()
        email = email.strip().lower()
        if not display_name or len(display_name) > MAX_DISPLAY_NAME:
            raise ValueError("display_name must be 1 to 64 characters")
        if "@" not in email:
            raise ValueError("email must contain @")
        profile = Profile(user_id, display_name, email)
        self.store.save(profile)
        return profile
