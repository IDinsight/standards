from app.persistence.migrate import apply_migrations


def table_names(conn):
    rows = conn.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
    return {row["name"] for row in rows}


def test_fresh_database_gets_every_table(conn):
    assert {"surveys", "responses", "api_keys", "schema_migrations"} <= table_names(conn)


def test_versions_are_recorded_in_order(conn):
    rows = conn.execute("SELECT version FROM schema_migrations ORDER BY version")
    assert [row["version"] for row in rows] == ["0001_create_surveys", "0002_create_api_keys"]


def test_rerun_applies_nothing(conn):
    assert apply_migrations(conn) == []
