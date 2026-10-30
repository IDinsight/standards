"""In-memory record store and listing filters."""
from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Literal

Status = Literal["active", "archived"]


@dataclass(frozen=True)
class RecordItem:
    id: int
    title: str
    owner: str
    status: Status
    created_at: str  # ISO 8601, UTC


@dataclass(frozen=True)
class RecordFilter:
    status: Status | None = None
    owner: str | None = None
    q: str | None = None


class RecordStore:
    def __init__(self, records: Iterable[RecordItem] = ()) -> None:
        self._records = list(records)

    def find(self, criteria: RecordFilter | None = None) -> list[RecordItem]:
        """Return the records matching every set field of ``criteria``, ordered by id.

        ``status`` and ``owner`` match exactly; ``q`` is a case-insensitive
        substring of the title.
        """
        criteria = criteria or RecordFilter()
        q = criteria.q.lower() if criteria.q else None
        matches = [
            record
            for record in self._records
            if (criteria.status is None or record.status == criteria.status)
            and (criteria.owner is None or record.owner == criteria.owner)
            and (q is None or q in record.title.lower())
        ]
        return sorted(matches, key=lambda record: record.id)

    def get(self, record_id: int) -> RecordItem | None:
        return next((record for record in self._records if record.id == record_id), None)
