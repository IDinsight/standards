"""Application settings, read from environment variables."""

import os
from collections.abc import Callable
from dataclasses import dataclass, field


def _env_str(name: str, default: str) -> Callable[[], str]:
    return lambda: os.environ.get(name, default)


def _env_int(name: str, default: int) -> Callable[[], int]:
    return lambda: int(os.environ.get(name, str(default)))


@dataclass(frozen=True)
class Settings:
    redis_url: str = field(default_factory=_env_str("REDIS_URL", "redis://localhost:6379/0"))
    database_url: str = field(default_factory=_env_str("DATABASE_URL", "sqlite:///./accounts.db"))
    token_secret: str = field(default_factory=_env_str("TOKEN_SECRET", "development-secret"))
    token_ttl_seconds: int = field(default_factory=_env_int("TOKEN_TTL_SECONDS", 3600))


settings = Settings()
