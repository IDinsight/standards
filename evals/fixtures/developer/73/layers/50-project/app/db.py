import os
import sqlite3

DB_PATH = os.environ.get("FIELDBOOK_DB", "fieldbook.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS password_resets (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
);
"""


def connect(path=None):
    conn = sqlite3.connect(path or DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn=None):
    conn = conn or connect()
    conn.executescript(SCHEMA)
    conn.commit()
    return conn


def get_conn():
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()
