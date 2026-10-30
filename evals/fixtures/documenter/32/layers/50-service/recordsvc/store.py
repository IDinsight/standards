"""In-memory record store."""

from dataclasses import dataclass

__all__ = ["RecordItem", "RecordStore"]

STATUSES = ("active", "archived")


@dataclass(frozen=True)
class RecordItem:
    """One record of the admin tool.

    Fields: `id`, `title`, `owner`, `status` (`active` or `archived`), and
    `created_at` (ISO 8601, UTC).
    """

    id: int
    title: str
    owner: str
    status: str
    created_at: str


class RecordStore:
    """Holds records in memory for the life of the process."""

    def __init__(self, records=()):
        self._records = {record.id: record for record in records}

    def list(self, status=None, owner=None, q=None):
        """Return the records matching every given filter, ordered by `id`.

        `status` and `owner` must match exactly; `q` is a case-insensitive
        substring of the title. A filter left as `None` matches everything.
        """
        needle = q.lower() if q else None
        return [
            record
            for record in sorted(self._records.values(), key=lambda item: item.id)
            if (status is None or record.status == status)
            and (owner is None or record.owner == owner)
            and (needle is None or needle in record.title.lower())
        ]

    def get(self, record_id):
        """Return the record with `record_id`, or `None` when there is none."""
        return self._records.get(record_id)
