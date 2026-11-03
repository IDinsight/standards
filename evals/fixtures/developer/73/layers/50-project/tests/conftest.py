import pytest

from app.db import connect, init_db


@pytest.fixture
def conn():
    c = init_db(connect(":memory:"))
    yield c
    c.close()
