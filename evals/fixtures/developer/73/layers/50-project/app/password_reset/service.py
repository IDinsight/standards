import secrets
from datetime import datetime, timedelta, timezone

from app.notifications.mailer import send_email

RESET_TTL = timedelta(hours=1)
RESET_URL = "https://app.fieldbook.example/reset?token={token}"


def request_reset(conn, email, send=send_email):
    """Create a reset token and email the link. Unknown addresses are ignored."""
    row = conn.execute(
        "SELECT id, email FROM users WHERE email = ?", (email.strip().lower(),)
    ).fetchone()
    if row is None:
        return False
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + RESET_TTL
    conn.execute(
        "INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, row["id"], expires.isoformat()),
    )
    conn.commit()
    link = RESET_URL.format(token=token)
    send(
        row["email"],
        "Reset your Fieldbook password",
        f"Use this link within an hour to choose a new password:\n{link}\n",
    )
    return True
