import sqlite3

from fastapi import APIRouter, Depends

from app.deps import get_connection

router = APIRouter(tags=["health"])


@router.get("/health")
def health(conn: sqlite3.Connection = Depends(get_connection)) -> dict[str, str]:
    conn.execute("SELECT 1").fetchone()
    return {"status": "ok"}
