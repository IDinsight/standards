from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from itertools import count
from threading import Lock


@dataclass
class Note:
    id: int
    owner: str
    title: str
    body: str
    created_at: str

    def as_dict(self) -> dict:
        data = asdict(self)
        data.pop("owner")
        return data


class NoteStore:
    """In-memory note storage; every read and write is scoped to an owner."""

    def __init__(self) -> None:
        self._notes: dict[int, Note] = {}
        self._ids = count(1)
        self._lock = Lock()

    def create(self, owner: str, title: str, body: str = "") -> Note:
        title = title.strip()
        if not title:
            raise ValueError("title must not be blank")
        with self._lock:
            note = Note(
                id=next(self._ids),
                owner=owner,
                title=title,
                body=body,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            self._notes[note.id] = note
        return note

    def get(self, owner: str, note_id: int) -> Note | None:
        note = self._notes.get(note_id)
        return note if note is not None and note.owner == owner else None

    def list_for(self, owner: str, offset: int = 0, limit: int = 20) -> list[Note]:
        mine = [note for note in self._notes.values() if note.owner == owner]
        return mine[offset : offset + limit]

    def delete(self, owner: str, note_id: int) -> bool:
        with self._lock:
            if self.get(owner, note_id) is None:
                return False
            del self._notes[note_id]
            return True
