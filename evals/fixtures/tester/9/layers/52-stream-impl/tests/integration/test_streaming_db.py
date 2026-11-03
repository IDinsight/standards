import pytest

from app.filters import RecordFilter
from app.repository import add_record
from app.streaming import iter_records

pytestmark = pytest.mark.integration


def test_iter_records_streams_every_match_in_id_order_across_batches(conn):
    for number in range(7):
        add_record(conn, f"Record {number}", "dana" if number % 2 == 0 else "li")
    conn.commit()
    titles = [record.title for record in iter_records(conn, RecordFilter(owner="dana"), batch_size=2)]
    conn.rollback()
    assert titles == ["Record 0", "Record 2", "Record 4", "Record 6"]
