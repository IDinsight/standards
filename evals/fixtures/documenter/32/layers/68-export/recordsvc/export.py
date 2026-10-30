"""CSV serialization and export files."""

import os
from datetime import timezone

__all__ = ["csv_cell", "to_csv", "export_file_name", "write_export"]

COLUMNS = ("id", "title", "owner", "status", "created_at")


def csv_cell(value):
    """Quote `value` when it contains a comma."""
    text = str(value)
    if any(char in text for char in ',"\r\n'):
        return '"' + text.replace('"', '""') + '"'
    return text


def to_csv(records):
    """Return a header row and one row per record, each ending with CRLF."""
    rows = [",".join(COLUMNS)]
    rows += [",".join(csv_cell(getattr(record, column)) for column in COLUMNS) for record in records]
    return "".join(row + "\r\n" for row in rows)


def export_file_name(now):
    """Return `export-<YYYY-MM-DD>.csv` for the date of `now`."""
    return "records-" + now.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + ".csv"


def write_export(directory, records, now):
    """Write `to_csv(records)` to `directory/export-<YYYY-MM-DD>.csv` and return the path."""
    csv = to_csv(records)
    file_name = export_file_name(now)
    path = os.path.join(directory, file_name)
    os.makedirs(directory, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as handle:
        handle.write(csv)
    return file_name, path, csv
