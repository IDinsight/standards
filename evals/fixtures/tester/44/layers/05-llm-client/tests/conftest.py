import os

# A placeholder so no test run can authenticate against the LLM provider,
# even when a developer has a real key exported in their shell.
os.environ["LLM_API_KEY"] = "test-placeholder-key"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.notes.store import NoteStore, get_note_store  # noqa: E402


@pytest.fixture
def store():
    return NoteStore()


@pytest.fixture
def client(store):
    app.dependency_overrides[get_note_store] = lambda: store
    yield TestClient(app)
    app.dependency_overrides.clear()
