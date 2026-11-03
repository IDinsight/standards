from ledger.config import DEFAULTS, connection


def open_account(code, name, currency=None):
    currency = currency or DEFAULTS["currency"]
    cursor = connection.execute(
        "INSERT INTO accounts (code, name, currency) VALUES (?, ?, ?)",
        (code, name, currency),
    )
    connection.commit()
    return cursor.lastrowid


def list_accounts(limit=None):
    limit = limit or DEFAULTS["page_size"]
    rows = connection.execute(
        "SELECT id, code, name, currency FROM accounts ORDER BY code LIMIT ?", (limit,)
    ).fetchall()
    return [dict(zip(("id", "code", "name", "currency"), row)) for row in rows]
