from pathlib import Path

from app.config import database_url

SCHEMA_PATH = Path(__file__).with_name("schema.sql")


def connect(url: str | None = None):
    """Open a psycopg connection. Transactions are not autocommitted."""
    import psycopg  # imported on first use so query-building code loads without the driver

    return psycopg.connect(url or database_url())


def apply_schema(conn) -> None:
    """Create the tables and indexes in app/schema.sql if they do not exist."""
    for statement in SCHEMA_PATH.read_text().split(";"):
        if statement.strip():
            conn.execute(statement)
