import os

os.environ.setdefault("SECRET_KEY", "local-test-secret-key-0123456789abcdef")
os.environ.setdefault("DATABASE_URL", "sqlite://")

from collections.abc import Callable, Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.main import app
from app.users.model import User
from app.utils.database import get_session
from app.utils.security import create_access_token


@pytest.fixture
def session() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def make_user(session: Session) -> Callable[[str], User]:
    def _make_user(email: str) -> User:
        user = User(email=email)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    return _make_user


@pytest.fixture
def auth_headers() -> Callable[[User], dict[str, str]]:
    def _auth_headers(user: User) -> dict[str, str]:
        return {"Authorization": f"Bearer {create_access_token(str(user.id))}"}

    return _auth_headers
