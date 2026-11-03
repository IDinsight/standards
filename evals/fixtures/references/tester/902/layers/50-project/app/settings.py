"""Configuration, read once at import from .env and the environment."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


@dataclass(frozen=True)
class Settings:
    database_path: str


def load_settings(env_file: Path = ENV_FILE) -> Settings:
    file_values = read_env_file(env_file)

    def get(name: str, default: str) -> str:
        return os.environ.get(name, file_values.get(name, default))

    return Settings(
        database_path=get("DATABASE_PATH", str(PROJECT_ROOT / "invoices.db")),
    )


settings = load_settings()
