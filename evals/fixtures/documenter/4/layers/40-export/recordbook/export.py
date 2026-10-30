"""CSV export of records.

Rows follow RFC 4180 as written by the standard ``csv`` module: fields that
contain a comma, double quote, or line break are quoted, embedded double
quotes are doubled, and every row ends with CRLF.
"""

import csv
import io
from datetime import datetime, timezone
from pathlib import Path

COLUMNS = ("id", "title", "owner", "status", "created_at")


def to_csv(records):
    """Return the records as CSV text: a header row, then one row per record."""
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\r\n")
    writer.writerow(COLUMNS)
    for record in records:
        writer.writerow([getattr(record, column) for column in COLUMNS])
    return buffer.getvalue()


def default_export_path(export_dir, now=None):
    """Return ``<export_dir>/records-YYYYMMDDTHHMMSSZ.csv`` for the UTC time now."""
    now = now or datetime.now(timezone.utc)
    stamp = now.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return Path(export_dir) / f"records-{stamp}.csv"


def write_export(records, path, force=False):
    """Write records to path as CSV."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = "w" if force else "x"
    with open(path, mode, encoding="utf-8", newline="") as handle:
        handle.write(to_csv(records))
    return path
