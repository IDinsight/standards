import sqlite3
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def _migrations():
    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        version = int(path.name.split("_", 1)[0])
        yield version, path.read_text(encoding="utf-8")


def migrate(conn):
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for version, script in _migrations():
        if version <= current:
            continue
        conn.executescript(script)
        conn.execute(f"PRAGMA user_version = {version}")
        conn.commit()
    return conn.execute("PRAGMA user_version").fetchone()[0]


def connect(path=":memory:"):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    migrate(conn)
    return conn
