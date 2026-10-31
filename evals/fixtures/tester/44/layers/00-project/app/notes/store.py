from dataclasses import dataclass
from itertools import count


@dataclass
class Note:
    id: int
    text: str


class NoteStore:
    """In-memory note storage."""

    def __init__(self):
        self._notes = {}
        self._ids = count(1)

    def add(self, text):
        note = Note(next(self._ids), text)
        self._notes[note.id] = note
        return note

    def get(self, note_id):
        return self._notes.get(note_id)


_store = NoteStore()


def get_note_store():
    return _store
