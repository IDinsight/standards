"""Apply the SQL migrations in api/migrations, in order.

Usage: python -m app.persistence.migrate
"""

import sqlite3
import sys
from pathlib import Path

from app.config import load_settings
from app.persistence.db import connect

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


def pending(conn: sqlite3.Connection, directory: Path = MIGRATIONS_DIR) -> list[Path]:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "version TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    )
    conn.commit()
    applied = {row[0] for row in conn.execute("SELECT version FROM schema_migrations")}
    return [path for path in sorted(directory.glob("*.sql")) if path.stem not in applied]


def apply_migrations(conn: sqlite3.Connection, directory: Path = MIGRATIONS_DIR) -> list[str]:
    done = []
    for path in pending(conn, directory):
        conn.executescript(path.read_text(encoding="utf-8"))
        conn.execute("INSERT INTO schema_migrations (version) VALUES (?)", (path.stem,))
        conn.commit()
        done.append(path.stem)
    return done


def main() -> int:
    settings = load_settings()
    applied = apply_migrations(connect(settings.database_path))
    print(f"applied {len(applied)} migration(s) to {settings.database_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
