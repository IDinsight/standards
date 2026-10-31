from app.password_reset.service import request_reset
from app.signup.service import create_account


def test_reset_sends_link_to_known_user(conn):
    create_account(conn, "ada@example.org", "Ada", "correct horse battery")
    sent = []
    assert request_reset(conn, "Ada@example.org", send=lambda *args: sent.append(args)) is True
    ((to, subject, body),) = sent
    assert to == "ada@example.org"
    assert subject == "Reset your Fieldbook password"
    assert "reset?token=" in body


def test_unknown_address_sends_nothing(conn):
    sent = []
    assert request_reset(conn, "nobody@example.org", send=lambda *args: sent.append(args)) is False
    assert sent == []
