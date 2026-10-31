from app.signup.service import create_account, verify_password


def test_create_account_normalizes_email(conn):
    account = create_account(conn, "  Ada@Example.ORG ", " Ada ", "correct horse battery")
    assert account["email"] == "ada@example.org"
    assert account["display_name"] == "Ada"
    row = conn.execute("SELECT email FROM users WHERE id = ?", (account["id"],)).fetchone()
    assert row["email"] == "ada@example.org"


def test_duplicate_email_returns_none(conn):
    create_account(conn, "ada@example.org", "Ada", "correct horse battery")
    assert create_account(conn, "ADA@example.org", "Ada L", "another password") is None


def test_password_is_hashed(conn):
    account = create_account(conn, "ada@example.org", "Ada", "correct horse battery")
    stored = conn.execute(
        "SELECT password_hash FROM users WHERE id = ?", (account["id"],)
    ).fetchone()["password_hash"]
    assert "correct horse" not in stored
    assert verify_password("correct horse battery", stored)
    assert not verify_password("wrong password", stored)
