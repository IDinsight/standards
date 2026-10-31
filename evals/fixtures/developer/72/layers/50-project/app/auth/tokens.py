import hashlib


def token_fingerprint(token: str) -> str:
    """Short, stable identifier for a token that is safe to log."""
    return hashlib.sha256(token.encode()).hexdigest()[:8]
