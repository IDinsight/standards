"""In-memory record store."""

STATUSES = ("active", "archived")


class RecordStore:
    """In-memory collection of records kept in id order."""

    def __init__(self, records=()):
        """Create a store holding the given records."""
        self._records = {}
        for record in records:
            self.add(record)

    def add(self, record):
        """Add a record, replacing any existing record with the same id."""
        self._records[record.id] = record

    def get(self, record_id):
        """Return the record with this id, or None when there is none."""
        return self._records.get(record_id)

    def list(self, status=None, owner=None):
        """Return the records matching every given filter, ordered by id.

        A status other than "active" or "archived" raises ValueError.
        """
        if status is not None and status not in STATUSES:
            raise ValueError(f"unknown status: {status}")
        return [
            record
            for _, record in sorted(self._records.items())
            if (status is None or record.status == status)
            and (owner is None or record.owner == owner)
        ]

    def export_csv(self, path):
        """Write all records to a CSV file at path.

        The file starts with a header row (id, title, owner, status,
        created_at) followed by one line per record.
        """
        with open(path, "w", encoding="utf-8") as handle:
            handle.write("id,title,owner,status,created_at\n")
            for record in self.list():
                handle.write(f"{record.id},{record.title},{record.owner},{record.status},{record.created_at}\n")
