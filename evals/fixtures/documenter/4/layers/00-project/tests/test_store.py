from pathlib import Path

from recordbook.store import filter_records, load_records

DATA = Path(__file__).resolve().parent.parent / "data" / "records.json"


def test_load_records_orders_by_id(tmp_path):
    path = tmp_path / "records.json"
    path.write_text(
        '[{"id": 2, "title": "B", "owner": "li", "status": "active", "created_at": "2026-01-02T00:00:00Z"},'
        ' {"id": 1, "title": "A", "owner": "dana", "status": "archived", "created_at": "2026-01-01T00:00:00Z"}]',
        encoding="utf-8",
    )
    assert [record.id for record in load_records(path)] == [1, 2]


def test_filters_combine():
    records = load_records(DATA)
    assert [record.id for record in filter_records(records, status="active", owner="marco")] == [4, 6]


def test_query_is_case_insensitive():
    assert [record.id for record in filter_records(load_records(DATA), query="REVIEW")] == [3]
