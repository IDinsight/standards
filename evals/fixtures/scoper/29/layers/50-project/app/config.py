import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_path: str
    api_keys: frozenset


def load_settings() -> Settings:
    keys = os.environ.get("FIELDOPS_API_KEYS", "")
    return Settings(
        database_path=os.environ.get("FIELDOPS_DB", "fieldops.db"),
        api_keys=frozenset(key.strip() for key in keys.split(",") if key.strip()),
    )
