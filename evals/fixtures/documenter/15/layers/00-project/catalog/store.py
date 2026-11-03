from dataclasses import dataclass

STATUSES = ("active", "archived")


@dataclass(frozen=True)
class Record:
    """One catalog entry."""

    id: int
    title: str
    owner: str
    status: str = "active"


class RecordStore:
    """In-memory collection of records."""

    def __init__(self, records=()):
        self._records = {}
        for record in records:
            self.add(record)

    def add(self, record):
        """Add a record, replacing any stored record with the same id."""
        if record.status not in STATUSES:
            raise ValueError(f"unknown status: {record.status}")
        self._records[record.id] = record

    def get(self, record_id):
        """Return the record with this id, or None."""
        return self._records.get(record_id)

    def list(self, status=None, owner=None):
        """Return the records matching every given filter, ordered by id."""
        return [
            record
            for _, record in sorted(self._records.items())
            if (status is None or record.status == status)
            and (owner is None or record.owner == owner)
        ]
