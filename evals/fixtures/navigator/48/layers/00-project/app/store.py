import sqlite3

from app.models import Contact

SCHEMA = """
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
)
"""


class ContactStore:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(path)
        self.db.execute(SCHEMA)

    def save(self, contact):
        cursor = self.db.execute(
            "INSERT INTO contacts (name, email) VALUES (?, ?)", (contact.name, contact.email)
        )
        self.db.commit()
        return cursor.lastrowid

    def get(self, contact_id):
        row = self.db.execute(
            "SELECT name, email FROM contacts WHERE id = ?", (contact_id,)
        ).fetchone()
        return Contact(*row) if row else None

    def count(self):
        return self.db.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
