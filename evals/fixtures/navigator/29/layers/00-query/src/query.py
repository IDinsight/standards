"""Run filtered queries against the records table."""

from src.db import get_connection

ALLOWED_FIELDS = ("status", "owner", "region")


def build_where(filter_):
    clauses = []
    params = []
    for field, value in sorted(filter_.items()):
        if field not in ALLOWED_FIELDS:
            raise ValueError(f"unknown filter field: {field}")
        clauses.append(f"{field} = ?")
        params.append(value)
    return " AND ".join(clauses), params


def run_query(request, connection=None):
    filter_ = request.get("filter") or {}
    if not filter_:
        # Unfiltered requests would return the whole table.
        return []
    where, params = build_where(filter_)
    conn = connection or get_connection()
    rows = conn.execute(
        f"SELECT id, status, owner, region FROM records WHERE {where} ORDER BY id",
        params,
    ).fetchall()
    return [dict(zip(("id", "status", "owner", "region"), row)) for row in rows]
