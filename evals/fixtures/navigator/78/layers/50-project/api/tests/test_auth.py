import pytest

from app.auth import AuthError, authenticate, hash_key


def test_missing_header_is_rejected(repo):
    with pytest.raises(AuthError, match="missing credentials"):
        authenticate(None, repo)


def test_non_bearer_scheme_is_rejected(repo, api_key):
    with pytest.raises(AuthError, match="malformed credentials"):
        authenticate(f"Basic {api_key}", repo)


def test_empty_token_is_rejected(repo):
    with pytest.raises(AuthError, match="malformed credentials"):
        authenticate("Bearer ", repo)


def test_unknown_key_is_rejected(repo, api_key):
    with pytest.raises(AuthError, match="unknown key"):
        authenticate("Bearer not-a-key", repo)


def test_revoked_key_is_rejected(repo):
    key_id = repo.add_api_key("old partner", hash_key("old-key"))
    repo.revoke_api_key(key_id)
    with pytest.raises(AuthError, match="revoked key"):
        authenticate("Bearer old-key", repo)


def test_valid_key_is_accepted(repo, api_key):
    assert authenticate(f"Bearer {api_key}", repo).name == "tests"
