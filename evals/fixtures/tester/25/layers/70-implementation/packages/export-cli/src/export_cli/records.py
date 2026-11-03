"""Reading records dumps."""

import json
from pathlib import Path

FIELDS = ("id", "title", "owner", "status", "createdAt")


class RecordsError(Exception):
    """The records dump cannot be read or does not hold records."""


def load_records(path):
    """Records from a dump: a JSON list or an object with a records list."""
    path = Path(path)
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise RecordsError(f"records file not found: {path}") from None
    except UnicodeDecodeError:
        raise RecordsError(f"records file is not UTF-8 text: {path}") from None
    except OSError as error:
        raise RecordsError(f"cannot read records file {path}: {error.strerror}") from None
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise RecordsError(f"records file is not valid JSON: {path} (line {error.lineno})") from None
    records = data.get("records") if isinstance(data, dict) else data
    if not isinstance(records, list):
        raise RecordsError(f"records file does not hold a list of records: {path}")
    for number, record in enumerate(records, start=1):
        missing = [name for name in FIELDS if not isinstance(record, dict) or name not in record]
        if missing:
            raise RecordsError(f"record {number} in {path} is missing {', '.join(missing)}")
    return records


def select(records, status=None, owner=None):
    """Records matching every given filter, ordered by id."""
    chosen = [
        record
        for record in records
        if (status is None or record["status"] == status) and (owner is None or record["owner"] == owner)
    ]
    return sorted(chosen, key=lambda record: record["id"])
