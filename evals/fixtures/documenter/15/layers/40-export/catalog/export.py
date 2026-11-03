import csv
import io
from collections.abc import Iterable, Sequence

from catalog.store import Record

# Columns written when the caller does not choose any, in this order.
DEFAULT_COLUMNS: tuple[str, ...] = ("id", "title", "owner", "status")


def export_csv(records: Iterable[Record], columns: Sequence[str] = DEFAULT_COLUMNS) -> str:
    if not columns:
        raise ValueError("at least one column is required")
    unknown = [name for name in columns if name not in DEFAULT_COLUMNS]
    if unknown:
        raise ValueError(f"unknown column: {unknown[0]}")
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(columns)
    for record in records:
        writer.writerow([getattr(record, name) for name in columns])
    return buffer.getvalue()
