from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/inventory_api_dev"
    api_tokens: str = ""

    @property
    def token_set(self) -> set[str]:
        return {token.strip() for token in self.api_tokens.split(",") if token.strip()}


settings = Settings()
