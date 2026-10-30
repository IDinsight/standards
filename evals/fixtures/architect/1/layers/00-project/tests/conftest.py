import pytest

from app.db import connect
from app.repository import CustomerRepository
from app.service import ProfileService


@pytest.fixture
def repository():
    conn = connect()
    yield CustomerRepository(conn)
    conn.close()


@pytest.fixture
def service(repository):
    return ProfileService(repository)
