import sqlite3

from app.models import Profile

SCHEMA = """
CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL
)
"""


class ProfileStore:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(path)
        self.db.execute(SCHEMA)
        self.db.commit()

    def get(self, user_id):
        row = self.db.execute(
            "SELECT user_id, display_name, email FROM profiles WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        return Profile(*row) if row else None

    def save(self, profile):
        self.db.execute(
            "INSERT OR REPLACE INTO profiles (user_id, display_name, email) VALUES (?, ?, ?)",
            (profile.user_id, profile.display_name, profile.email),
        )
        self.db.commit()

    def close(self):
        self.db.close()
