import hashlib
import hmac
import secrets
from datetime import datetime, timezone

ITERATIONS = 100_000


def hash_password(password):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password, stored):
    _, iterations, salt_hex, digest_hex = stored.split("$")
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations)
    )
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_account(conn, email, display_name, password):
    """Create an account. Returns None when the email is already registered."""
    email = email.strip().lower()
    display_name = display_name.strip()
    if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
        return None
    cur = conn.execute(
        "INSERT INTO users (email, display_name, password_hash, created_at)"
        " VALUES (?, ?, ?, ?)",
        (
            email,
            display_name,
            hash_password(password),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    return {"id": cur.lastrowid, "email": email, "display_name": display_name}
