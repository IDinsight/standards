import sqlite3

import pytest

from src.query import run_query


def make_db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE records (id INTEGER PRIMARY KEY, status TEXT, owner TEXT, region TEXT)")
    conn.executemany(
        "INSERT INTO records VALUES (?, ?, ?, ?)",
        [
            (1, "open", "ana", "north"),
            (2, "closed", "ana", "south"),
            (3, "open", "ben", "south"),
        ],
    )
    return conn


def test_filter_by_status():
    rows = run_query({"filter": {"status": "open"}}, connection=make_db())
    assert [row["id"] for row in rows] == [1, 3]


def test_filter_by_two_fields():
    rows = run_query({"filter": {"status": "open", "region": "south"}}, connection=make_db())
    assert [row["id"] for row in rows] == [3]


def test_unknown_field_rejected():
    with pytest.raises(ValueError):
        run_query({"filter": {"colour": "red"}}, connection=make_db())
