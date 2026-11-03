import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    storage_dir: str


def load_settings(env=os.environ) -> Settings:
    return Settings(
        database_url=env.get("DATABASE_URL", "sqlite:///./datahub.db"),
        storage_dir=env.get("STORAGE_DIR", "./uploads"),
    )
