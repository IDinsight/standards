"""Local storage for API tokens."""

import sqlite3
from datetime import datetime, timezone

from ledgerctl.config import config_dir

DB_NAME = "credentials.sqlite3"

SCHEMA = """
CREATE TABLE IF NOT EXISTS credentials (
    base_url TEXT PRIMARY KEY,
    token TEXT NOT NULL,
    saved_at TEXT NOT NULL
)
"""


def db_path():
    return config_dir() / DB_NAME


def _connect():
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.execute(SCHEMA)
    return db


def save_token(base_url, token):
    db = _connect()
    try:
        with db:
            db.execute(
                "INSERT OR REPLACE INTO credentials (base_url, token, saved_at) VALUES (?, ?, ?)",
                (base_url, token, datetime.now(timezone.utc).isoformat()),
            )
    finally:
        db.close()


def load_token(base_url):
    if not db_path().exists():
        return None
    db = _connect()
    try:
        row = db.execute("SELECT token FROM credentials WHERE base_url = ?", (base_url,)).fetchone()
    finally:
        db.close()
    return row[0] if row else None
