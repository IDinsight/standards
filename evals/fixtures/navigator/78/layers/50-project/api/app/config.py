"""Runtime settings, read from the environment."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_path: str
    environment: str
    cors_origins: tuple[str, ...]


def load_settings() -> Settings:
    origins = os.environ.get("CORS_ORIGINS", "")
    return Settings(
        database_path=os.environ.get("DATABASE_PATH", "var/dev.sqlite3"),
        environment=os.environ.get("APP_ENV", "development"),
        cors_origins=tuple(origin.strip() for origin in origins.split(",") if origin.strip()),
    )
