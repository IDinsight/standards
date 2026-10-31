from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str
    database_url: str
    test_database_url: str = ""
    access_token_minutes: int = 60

    llm_api_key: str | None = None
    llm_model: str = "gpt-4.1-mini"
    llm_timeout_seconds: float = 20.0
    llm_default_retry_after_seconds: int = 30


settings = Settings()
