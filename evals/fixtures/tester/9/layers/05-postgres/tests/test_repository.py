from app.filters import RecordFilter
from app.repository import list_query


def test_list_query_without_filters_orders_by_id():
    sql, params = list_query(RecordFilter())
    assert sql == "SELECT id, title, owner, status, created_at FROM records ORDER BY id"
    assert params == []


def test_list_query_combines_filters():
    sql, params = list_query(RecordFilter(status="active", owner="dana", q="lease"))
    assert sql.endswith("WHERE status = %s AND owner = %s AND title ILIKE %s ESCAPE '!' ORDER BY id")
    assert params == ["active", "dana", "%lease%"]


def test_list_query_matches_wildcard_characters_literally():
    _, params = list_query(RecordFilter(q="50%_off"))
    assert params == ["%50!%!_off%"]
