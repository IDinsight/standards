import pytest


@pytest.fixture
def tmp_db(tmp_path):
    return str(tmp_path / "helpdesk.sqlite3")
