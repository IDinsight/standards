import os

DEFAULT_DATABASE_URL = "postgresql://records:records@localhost:5432/records"


def database_url() -> str:
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)
