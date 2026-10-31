from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "Survey API"
    # Required: startup fails when these are not set.
    secret_key: str
    database_url: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


settings = Settings()
