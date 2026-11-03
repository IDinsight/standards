import sqlite3

from app.db import MIGRATIONS_DIR, connect, migrate


def test_fresh_database_is_at_latest_version():
    conn = connect()
    latest = max(int(path.name.split("_", 1)[0]) for path in MIGRATIONS_DIR.glob("*.sql"))
    assert conn.execute("PRAGMA user_version").fetchone()[0] == latest
    conn.close()


def test_upgrade_keeps_existing_rows():
    conn = sqlite3.connect(":memory:")
    conn.executescript((MIGRATIONS_DIR / "001_create_customers.sql").read_text(encoding="utf-8"))
    conn.execute("PRAGMA user_version = 1")
    conn.execute(
        "INSERT INTO customers (full_name, email, created_at) VALUES (?, ?, ?)",
        ("Grace Hopper", "grace@example.org", "2025-11-02T09:00:00Z"),
    )
    conn.commit()
    assert migrate(conn) == 2
    assert conn.execute("SELECT full_name, phone FROM customers").fetchone() == ("Grace Hopper", None)
    conn.close()
