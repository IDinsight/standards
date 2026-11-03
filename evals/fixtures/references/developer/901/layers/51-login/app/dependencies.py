"""FastAPI dependencies that build the production implementations."""

from functools import lru_cache

from app.config import settings
from app.db.users import SqlUserRepository
from app.services.users import UserRepository


@lru_cache
def get_user_repository() -> UserRepository:
    return SqlUserRepository(settings.database_url)
