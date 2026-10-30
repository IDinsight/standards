"""Stream matching records from PostgreSQL without loading them all.

Uses a named (server-side) cursor, which PostgreSQL keeps open only inside a
transaction, so callers must not pass an autocommit connection.
"""
from collections.abc import Iterator

from app.filters import RecordFilter
from app.repository import Record, list_query


def iter_records(conn, record_filter: RecordFilter = RecordFilter(), batch_size: int = 500) -> Iterator[Record]:
    """Yield the records matching the filter in id order, batch_size rows per fetch."""
    sql, params = list_query(record_filter)
    with conn.cursor(name="records_stream") as cursor:
        cursor.itersize = batch_size
        cursor.execute(sql, params)
        for row in cursor:
            yield Record(*row)
