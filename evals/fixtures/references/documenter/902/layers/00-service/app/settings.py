"""Configuration read from the environment."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    upload_dir: str


def load_settings(environ=os.environ):
    return Settings(
        database_url=environ.get("DATABASE_URL", "sqlite:///./data/imports.db"),
        upload_dir=environ.get("UPLOAD_DIR", "./data/uploads"),
    )
