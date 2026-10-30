"""CSV output for records."""

import csv
import io

from .records import FIELDS


def write_csv(handle, records):
    """Write a header row and one row per record, CRLF line endings, RFC 4180 quoting."""
    writer = csv.writer(handle, lineterminator="\r\n")
    writer.writerow(FIELDS)
    for record in records:
        writer.writerow([record[field] for field in FIELDS])


def to_csv(records):
    buffer = io.StringIO()
    write_csv(buffer, records)
    return buffer.getvalue()
