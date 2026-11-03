"""SQLite persistence for import records."""

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS imports (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    status TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    created_at TEXT NOT NULL
)
"""

COLUMNS = ("id", "filename", "status", "row_count", "created_at")


def sqlite_path(database_url):
    """Return the file path in a sqlite:/// URL."""
    prefix = "sqlite:///"
    if not database_url.startswith(prefix):
        raise ValueError("DATABASE_URL must be a sqlite:/// URL")
    return database_url[len(prefix):] or ":memory:"


class ImportStore:
    def __init__(self, path):
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute(SCHEMA)

    def create(self, filename, status, row_count):
        record = {
            "id": uuid.uuid4().hex,
            "filename": filename,
            "status": status,
            "row_count": row_count,
            "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        self.db.execute(
            "INSERT INTO imports (id, filename, status, row_count, created_at) VALUES (?, ?, ?, ?, ?)",
            tuple(record[column] for column in COLUMNS),
        )
        self.db.commit()
        return record

    def get(self, import_id):
        row = self.db.execute(
            "SELECT id, filename, status, row_count, created_at FROM imports WHERE id = ?",
            (import_id,),
        ).fetchone()
        return dict(zip(COLUMNS, row)) if row else None
