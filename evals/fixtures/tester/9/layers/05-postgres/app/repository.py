from dataclasses import dataclass
from datetime import datetime

from app.filters import RecordFilter

COLUMNS = ("id", "title", "owner", "status", "created_at")


@dataclass(frozen=True)
class Record:
    id: int
    title: str
    owner: str
    status: str
    created_at: datetime


def escape_like(text: str) -> str:
    """Make text match literally inside an ILIKE pattern that uses ESCAPE '!'."""
    return text.replace("!", "!!").replace("%", "!%").replace("_", "!_")


def list_query(record_filter: RecordFilter) -> tuple[str, list]:
    """SELECT for the records matching every given filter, ordered by id."""
    clauses: list[str] = []
    params: list = []
    if record_filter.status:
        clauses.append("status = %s")
        params.append(record_filter.status)
    if record_filter.owner:
        clauses.append("owner = %s")
        params.append(record_filter.owner)
    if record_filter.q:
        clauses.append("title ILIKE %s ESCAPE '!'")
        params.append(f"%{escape_like(record_filter.q)}%")
    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    return f"SELECT {', '.join(COLUMNS)} FROM records{where} ORDER BY id", params


def list_records(conn, record_filter: RecordFilter = RecordFilter()) -> list[Record]:
    sql, params = list_query(record_filter)
    with conn.cursor() as cursor:
        cursor.execute(sql, params)
        return [Record(*row) for row in cursor.fetchall()]


def add_record(conn, title: str, owner: str, status: str = "active") -> int:
    """Insert a record and return its id. The caller commits."""
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO records (title, owner, status) VALUES (%s, %s, %s) RETURNING id",
            (title, owner, status),
        )
        return cursor.fetchone()[0]
