import sqlite3

from fastapi import APIRouter, Depends

from app.auth import require_api_key
from app.db import get_db

router = APIRouter(prefix="/enumerators", tags=["enumerators"], dependencies=[Depends(require_api_key)])


@router.get("")
def list_enumerators(region: str | None = None, db: sqlite3.Connection = Depends(get_db)):
    if region:
        rows = db.execute(
            "SELECT id, name, region, active FROM enumerators WHERE region = ? ORDER BY name", (region,)
        ).fetchall()
    else:
        rows = db.execute("SELECT id, name, region, active FROM enumerators ORDER BY name").fetchall()
    return [dict(row) | {"active": bool(row["active"])} for row in rows]
