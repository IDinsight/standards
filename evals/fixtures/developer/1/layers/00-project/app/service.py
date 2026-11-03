from app.models import Profile


class ProfileService:
    def __init__(self, store):
        self.store = store

    def get_profile(self, user_id):
        return self.store.get(user_id)

    def update_profile(self, user_id, display_name, email):
        profile = Profile(user_id, display_name.strip(), email.strip().lower())
        self.store.save(profile)
        return profile
