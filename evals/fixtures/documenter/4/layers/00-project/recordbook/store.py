"""Record storage backed by a JSON file."""

import json
from dataclasses import dataclass

STATUSES = ("active", "archived")


@dataclass(frozen=True)
class Record:
    id: int
    title: str
    owner: str
    status: str
    created_at: str


def load_records(path):
    """Read records from the JSON file at path.

    The file holds a list of objects with id, title, owner, status, and
    created_at keys. Records are returned ordered by id.
    """
    with open(path, encoding="utf-8") as handle:
        raw = json.load(handle)
    records = [Record(**item) for item in raw]
    return sorted(records, key=lambda record: record.id)


def filter_records(records, status=None, owner=None, query=None):
    """Return the records matching every given filter, in their original order.

    status and owner must match exactly; query is a case-insensitive
    substring of the title. None or an empty string means no filter.
    """
    needle = query.lower() if query else None
    return [
        record
        for record in records
        if (not status or record.status == status)
        and (not owner or record.owner == owner)
        and (not needle or needle in record.title.lower())
    ]
