import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.environ.get("APP_NAME", "digest-api")
    page_size: int = int(os.environ.get("PAGE_SIZE", "50"))


settings = Settings()
