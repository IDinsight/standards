from app.services.passwords import hash_password, verify_password


def test_matching_password_verifies():
    stored = hash_password("correct horse battery")
    assert verify_password("correct horse battery", stored)


def test_other_password_does_not_verify():
    stored = hash_password("correct horse battery")
    assert not verify_password("correct horse staple", stored)


def test_same_salt_gives_same_hash():
    salt = bytes(16)
    assert hash_password("pw", salt=salt) == hash_password("pw", salt=salt)


def test_malformed_hash_does_not_verify():
    assert not verify_password("pw", "not-a-hash")
