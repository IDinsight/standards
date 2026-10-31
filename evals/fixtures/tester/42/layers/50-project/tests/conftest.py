import os
import secrets

# Test-only settings; they must be set before the application is imported.
os.environ.setdefault("SECRET_KEY", secrets.token_urlsafe(32))
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://cases:cases@localhost:5432/cases_test")
os.environ.setdefault("TEST_DATABASE_URL", "postgresql+psycopg://cases:cases@localhost:5432/cases_test")

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import Session, create_engine  # noqa: E402

from app.main import app  # noqa: E402
from app.users.model import User  # noqa: E402
from app.utils.config import settings  # noqa: E402
from app.utils.database import get_session  # noqa: E402
from app.utils.security import hash_password  # noqa: E402

test_engine = create_engine(settings.test_database_url)


@pytest.fixture(scope="session", autouse=True)
def run_migrations():
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", settings.test_database_url)
    command.upgrade(cfg, "head")


@pytest.fixture(name="session")
def session_fixture():
    # Commits made by the app become savepoints inside this outer transaction,
    # so the rollback undoes everything the test wrote.
    with test_engine.connect() as connection:
        transaction = connection.begin()
        with Session(bind=connection, join_transaction_mode="create_savepoint") as session:
            yield session
        transaction.rollback()


@pytest.fixture(name="client")
def client_fixture(session):
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(name="login")
def login_fixture(client, session):
    def _login(email="owner@example.test", admin=False):
        password = secrets.token_urlsafe(16)
        user = User(email=email, hashed_password=hash_password(password), is_admin=admin)
        session.add(user)
        session.commit()
        session.refresh(user)
        token = client.post("/auth/login", data={"username": email, "password": password}).json()["access_token"]
        return user, {"Authorization": f"Bearer {token}"}

    return _login
