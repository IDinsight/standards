from fastapi import Depends, Header, HTTPException, status

from app.config import Settings, load_settings


def get_settings() -> Settings:
    return load_settings()


def require_api_key(
    x_api_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> str:
    if not x_api_key or x_api_key not in settings.api_keys:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid or missing API key")
    return x_api_key
