"""Credential checks for the login endpoint."""

import logging

from app.services.passwords import verify_password
from app.services.users import User, UserRepository

logger = logging.getLogger(__name__)


def authenticate_user(
    email: str,
    password: str,
    *,
    client_ip: str,
    users: UserRepository,
) -> User | None:
    """Return the user whose password matches, or None for rejected credentials."""
    user = users.get_by_email(email)
    if user is None or not verify_password(password, user.password_hash):
        logger.info("Failed login for %s from %s", email, client_ip)
        return None
    return user
