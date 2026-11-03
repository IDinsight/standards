from app.models import Profile
from app.store import ProfileStore


def test_profiles_survive_reopen(tmp_path):
    path = tmp_path / "profiles.db"
    store = ProfileStore(str(path))
    store.save(Profile(7, "Grace", "grace@x.org"))
    store.close()

    reopened = ProfileStore(str(path))
    assert reopened.get(7) == Profile(7, "Grace", "grace@x.org")
    reopened.close()
