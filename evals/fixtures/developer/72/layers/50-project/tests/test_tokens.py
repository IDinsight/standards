from app.auth.tokens import token_fingerprint


def test_fingerprint_is_short_and_stable():
    assert token_fingerprint("abc") == token_fingerprint("abc")
    assert len(token_fingerprint("abc")) == 8


def test_fingerprint_differs_between_tokens():
    assert token_fingerprint("abc") != token_fingerprint("abd")
