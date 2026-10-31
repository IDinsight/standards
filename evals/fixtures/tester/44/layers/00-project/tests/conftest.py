import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.notes.store import NoteStore, get_note_store


@pytest.fixture
def store():
    return NoteStore()


@pytest.fixture
def client(store):
    app.dependency_overrides[get_note_store] = lambda: store
    yield TestClient(app)
    app.dependency_overrides.clear()
