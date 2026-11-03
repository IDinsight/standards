import pytest

from app.services.notes import NoteStore


def test_create_and_get_scoped_to_owner():
    store = NoteStore()
    note = store.create("ana", "  Groceries  ", "milk")
    assert note.title == "Groceries"
    assert store.get("ana", note.id) == note
    assert store.get("ben", note.id) is None


def test_blank_title_rejected():
    with pytest.raises(ValueError):
        NoteStore().create("ana", "   ")


def test_list_returns_only_owner_notes_in_order():
    store = NoteStore()
    first = store.create("ana", "one")
    store.create("ben", "other")
    second = store.create("ana", "two")
    assert [n.id for n in store.list_for("ana")] == [first.id, second.id]
    assert [n.id for n in store.list_for("ana", offset=1, limit=1)] == [second.id]


def test_delete_requires_owner():
    store = NoteStore()
    note = store.create("ana", "one")
    assert store.delete("ben", note.id) is False
    assert store.delete("ana", note.id) is True
    assert store.get("ana", note.id) is None


def test_as_dict_omits_owner():
    note = NoteStore().create("ana", "one")
    data = note.as_dict()
    assert "owner" not in data
    assert data["title"] == "one"
