from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # "production" in production (ENVIRONMENT=production).
    environment: str = "development"
    # Read from the environment as JSON, for example '["https://notes.example.org"]'.
    cors_origins: list[str] = ["http://localhost:5173"]
    page_size_max: int = 100


settings = Settings()
