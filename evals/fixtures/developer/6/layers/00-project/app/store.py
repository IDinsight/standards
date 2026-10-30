import sqlite3

from app.models import Account

MIGRATIONS = [
    """
    CREATE TABLE accounts (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
    )
    """,
    "ALTER TABLE accounts ADD COLUMN phone TEXT",
    "ALTER TABLE accounts ADD COLUMN mailing_address TEXT",
]

COLUMNS = ("id", "name", "email", "status", "phone", "mailing_address")


class AccountStore:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(path)
        self.migrate()

    def migrate(self):
        version = self.db.execute("PRAGMA user_version").fetchone()[0]
        for index, statement in enumerate(MIGRATIONS[version:], start=version + 1):
            self.db.execute(statement)
            self.db.execute(f"PRAGMA user_version = {index}")
        self.db.commit()

    def get(self, account_id):
        row = self.db.execute(
            f"SELECT {', '.join(COLUMNS)} FROM accounts WHERE id = ?", (account_id,)
        ).fetchone()
        return Account(*row) if row else None

    def list(self):
        rows = self.db.execute(f"SELECT {', '.join(COLUMNS)} FROM accounts ORDER BY id").fetchall()
        return [Account(*row) for row in rows]

    def save(self, account):
        values = tuple(getattr(account, column) for column in COLUMNS)
        placeholders = ", ".join("?" for _ in COLUMNS)
        self.db.execute(
            f"INSERT OR REPLACE INTO accounts ({', '.join(COLUMNS)}) VALUES ({placeholders})", values
        )
        self.db.commit()
