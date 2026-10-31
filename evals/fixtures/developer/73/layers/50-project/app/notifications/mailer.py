import os
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.environ.get("SMTP_HOST", "localhost")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "25"))
MAIL_FROM = os.environ.get("MAIL_FROM", "Fieldbook <no-reply@fieldbook.example>")


class MailError(Exception):
    """Raised when the SMTP server cannot be reached or rejects the message."""


def build_message(to, subject, body):
    msg = EmailMessage()
    msg["From"] = MAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    return msg


def send_email(to, subject, body, *, timeout=10):
    """Send a plain-text email. Returns once the server accepts it."""
    msg = build_message(to, subject, body)
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=timeout) as smtp:
            smtp.send_message(msg)
    except (OSError, smtplib.SMTPException) as exc:
        raise MailError(str(exc)) from exc
