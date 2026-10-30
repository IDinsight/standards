"""Reading records dumps."""

import json
from pathlib import Path

FIELDS = ("id", "title", "owner", "status", "createdAt")


def load_records(path):
    """Records from a dump: a JSON list or an object with a records list."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return data["records"] if isinstance(data, dict) else data


def select(records, status=None, owner=None):
    """Records matching every given filter, ordered by id."""
    chosen = [
        record
        for record in records
        if (status is None or record["status"] == status) and (owner is None or record["owner"] == owner)
    ]
    return sorted(chosen, key=lambda record: record["id"])
