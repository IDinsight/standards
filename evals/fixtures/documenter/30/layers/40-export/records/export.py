"""CSV export of records."""
from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from records.store import RecordItem

COLUMNS = ("id", "title", "owner", "status", "created_at")


def csv_cell(value: str | int) -> str:
    """Return ``value`` as one CSV field.

    A field that contains a comma, a double quote, CR, or LF is enclosed in
    double quotes, and each double quote inside it is doubled (RFC 4180).
    Other values are written unchanged.
    """
    text = str(value)
    if any(char in text for char in ',"\r\n'):
        return '"' + text.replace('"', '""') + '"'
    return text


def to_csv(records: Iterable[RecordItem]) -> str:
    """Return the header row and one row per record, each ending with CRLF."""
    rows = [",".join(COLUMNS)]
    for record in records:
        rows.append(",".join(csv_cell(getattr(record, column)) for column in COLUMNS))
    return "".join(row + "\r\n" for row in rows)


def export_file_name(now: datetime) -> str:
    """Return the file name for an export made at ``now``.

    The name has the form ``records-YYYY-MM-DD.csv`` and uses the local date
    of ``now``, so exports made on the same day share one file.
    """
    stamp = now.astimezone(timezone.utc)  # type: ignore[union-attr]
    return f"records-{stamp:%Y%m%dT%H%M%SZ}.csv"


@dataclass(frozen=True)
class ExportFile:
    name: str
    path: Path
    csv: str


def write_export(directory: Path, records: Iterable[RecordItem], now: datetime) -> ExportFile:
    """Write ``records`` as CSV into ``directory`` and return the written file.

    ``directory`` is created when missing. The file is named by
    ``export_file_name(now)``; an existing file with that name is replaced.
    """
    csv = to_csv(records)
    name = export_file_name(now)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / name
    path.write_text(csv, encoding="utf-8", newline="")
    return ExportFile(name, path, csv)
