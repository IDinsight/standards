from app.notifications.mailer import build_message


def test_build_message_headers():
    msg = build_message("ada@example.org", "Hello", "Body text\n")
    assert msg["To"] == "ada@example.org"
    assert msg["Subject"] == "Hello"
    assert msg.get_content() == "Body text\n"
