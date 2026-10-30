"""Schema migrations for the ledger database."""

MIGRATIONS = [
    (
        1,
        """CREATE TABLE accounts (
            id INTEGER PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            currency TEXT NOT NULL
        )""",
    ),
    (
        2,
        """CREATE TABLE entries (
            id INTEGER PRIMARY KEY,
            account_id INTEGER NOT NULL REFERENCES accounts (id),
            posted_on TEXT NOT NULL,
            amount TEXT NOT NULL,
            memo TEXT
        )""",
    ),
    (3, "CREATE INDEX entries_account_idx ON entries (account_id, posted_on)"),
]


def current_version(connection):
    connection.execute("CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)")
    row = connection.execute("SELECT MAX(version) FROM schema_version").fetchone()
    return row[0] or 0


def apply(connection):
    version = current_version(connection)
    for number, statement in MIGRATIONS:
        if number > version:
            connection.execute(statement)
            connection.execute("INSERT INTO schema_version (version) VALUES (?)", (number,))
    connection.commit()
