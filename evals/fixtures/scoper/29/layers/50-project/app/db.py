import sqlite3

from app.config import load_settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS enumerators (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY,
    enumerator_id INTEGER NOT NULL REFERENCES enumerators(id),
    household_code TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open'
);
"""


def connect(path):
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def get_db():
    conn = connect(load_settings().database_path)
    try:
        yield conn
    finally:
        conn.close()
