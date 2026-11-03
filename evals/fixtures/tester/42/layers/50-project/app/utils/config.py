from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str
    database_url: str
    test_database_url: str = ""
    access_token_minutes: int = 60


settings = Settings()
