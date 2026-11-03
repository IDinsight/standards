import os
from dataclasses import dataclass, field


def _env(name: str, default: str) -> str:
    return os.environ.get(name, default)


@dataclass(frozen=True)
class Settings:
    auth_base_url: str = field(default_factory=lambda: _env("AUTH_BASE_URL", "http://auth.internal:8080"))
    auth_service_key: str = field(default_factory=lambda: _env("AUTH_SERVICE_KEY", ""))
    auth_timeout_seconds: float = field(default_factory=lambda: float(_env("AUTH_TIMEOUT_SECONDS", "3")))
    data_platform_url: str = field(default_factory=lambda: _env("DATA_PLATFORM_URL", "http://dp.internal:9000"))


settings = Settings()
