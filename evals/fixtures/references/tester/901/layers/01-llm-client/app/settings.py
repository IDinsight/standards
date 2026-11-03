"""Worker settings, read once from the environment and the project .env file."""

import os
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


@dataclass(frozen=True)
class Settings:
    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    summary_max_tokens: int = 400
    database_path: str = "helpdesk.sqlite3"


def _read_env_file(path):
    values = {}
    if not path.is_file():
        return values
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip().strip("\"'")
    return values


def load_settings(env_file=ENV_FILE):
    """Read .env (when present), then the environment, which wins."""
    values = _read_env_file(Path(env_file))
    values.update(os.environ)
    defaults = Settings()
    return Settings(
        llm_api_key=values.get("LLM_API_KEY", defaults.llm_api_key),
        llm_base_url=values.get("LLM_BASE_URL", defaults.llm_base_url).rstrip("/"),
        llm_model=values.get("LLM_MODEL", defaults.llm_model),
        summary_max_tokens=int(values.get("SUMMARY_MAX_TOKENS", defaults.summary_max_tokens)),
        database_path=values.get("DATABASE_PATH", defaults.database_path),
    )


settings = load_settings()
