import sqlite3
from dataclasses import dataclass

from app.filters import RecordFilter

SCHEMA = """
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
)
"""


@dataclass(frozen=True)
class Record:
    id: int
    title: str
    owner: str
    status: str
    created_at: str


class RecordRepository:
    def __init__(self, path: str = "records.db"):
        self.db = sqlite3.connect(path)
        self.db.execute(SCHEMA)

    def add(self, title: str, owner: str, status: str = "active") -> int:
        with self.db:
            cursor = self.db.execute(
                "INSERT INTO records (title, owner, status) VALUES (?, ?, ?)", (title, owner, status)
            )
        return cursor.lastrowid

    def list(self, record_filter: RecordFilter = RecordFilter()) -> list[Record]:
        """Records matching every given filter, ordered by id."""
        clauses: list[str] = []
        params: list = []
        if record_filter.status:
            clauses.append("status = ?")
            params.append(record_filter.status)
        if record_filter.owner:
            clauses.append("owner = ?")
            params.append(record_filter.owner)
        if record_filter.q:
            clauses.append("instr(lower(title), lower(?)) > 0")
            params.append(record_filter.q)
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        rows = self.db.execute(
            f"SELECT id, title, owner, status, created_at FROM records{where} ORDER BY id", params
        ).fetchall()
        return [Record(*row) for row in rows]
