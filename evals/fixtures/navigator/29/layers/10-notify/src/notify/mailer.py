import os
import smtplib
from email.message import EmailMessage


def send_digest(to_address, body, host=None):
    message = EmailMessage()
    message["Subject"] = "Daily records digest"
    message["From"] = os.environ.get("DIGEST_FROM", "records@example.org")
    message["To"] = to_address
    message.set_content(body)
    with smtplib.SMTP(host or os.environ.get("SMTP_HOST", "localhost")) as smtp:
        smtp.send_message(message)
