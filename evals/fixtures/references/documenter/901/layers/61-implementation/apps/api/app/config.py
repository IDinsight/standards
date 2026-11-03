import os
from dataclasses import dataclass


class SettingsError(RuntimeError):
    pass


@dataclass(frozen=True)
class Settings:
    database_url: str
    storage_dir: str
    import_max_bytes: int


def load_settings(env=os.environ) -> Settings:
    raw = env.get("IMPORT_MAX_BYTES", "").strip()
    if not raw.isdigit() or int(raw) <= 0:
        raise SettingsError("IMPORT_MAX_BYTES must be set to a positive number of bytes")
    return Settings(
        database_url=env.get("DATABASE_URL", "sqlite:///./datahub.db"),
        storage_dir=env.get("STORAGE_DIR", "./uploads"),
        import_max_bytes=int(raw),
    )
