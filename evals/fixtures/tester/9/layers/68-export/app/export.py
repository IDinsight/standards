"""CSV export of the records matching the listing filters."""
import csv
from collections.abc import Iterable
from typing import TextIO

from app.filters import RecordFilter
from app.repository import COLUMNS, Record
from app.streaming import iter_records


def write_csv(records: Iterable[Record], out: TextIO) -> int:
    """Write a header row and one row per record; return the number of records.

    Rows end with CRLF. The csv module's minimal quoting encloses fields that
    contain a comma, double quote, CR, or LF and doubles embedded quotes.
    """
    writer = csv.writer(out, lineterminator="\r\n")
    writer.writerow(COLUMNS)
    count = 0
    for record in records:
        writer.writerow([record.id, record.title, record.owner, record.status, record.created_at.isoformat()])
        count += 1
    return count


def export_csv(conn, record_filter: RecordFilter, out: TextIO, batch_size: int = 500) -> int:
    """Stream the matching records to out as CSV from one consistent snapshot."""
    with conn.transaction():
        conn.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY")
        return write_csv(iter_records(conn, record_filter, batch_size), out)
