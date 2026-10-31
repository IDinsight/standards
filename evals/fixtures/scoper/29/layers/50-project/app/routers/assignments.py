import sqlite3
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.assignments import is_overdue, validate_household_code
from app.auth import require_api_key
from app.db import get_db

router = APIRouter(prefix="/assignments", tags=["assignments"], dependencies=[Depends(require_api_key)])


class AssignmentIn(BaseModel):
    enumerator_id: int
    household_code: str
    due_date: date


def _row_to_dict(row, today):
    due = date.fromisoformat(row["due_date"])
    return {
        "id": row["id"],
        "enumerator_id": row["enumerator_id"],
        "household_code": row["household_code"],
        "due_date": row["due_date"],
        "status": row["status"],
        "overdue": is_overdue(due, row["status"], today),
    }


@router.get("")
def list_assignments(enumerator_id: int, db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        "SELECT * FROM assignments WHERE enumerator_id = ? ORDER BY due_date", (enumerator_id,)
    ).fetchall()
    today = date.today()
    return [_row_to_dict(row, today) for row in rows]


@router.post("", status_code=201)
def create_assignment(body: AssignmentIn, db: sqlite3.Connection = Depends(get_db)):
    try:
        code = validate_household_code(body.household_code)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    enumerator = db.execute(
        "SELECT id FROM enumerators WHERE id = ? AND active = 1", (body.enumerator_id,)
    ).fetchone()
    if enumerator is None:
        raise HTTPException(status_code=404, detail="enumerator not found")
    cursor = db.execute(
        "INSERT INTO assignments (enumerator_id, household_code, due_date) VALUES (?, ?, ?)",
        (body.enumerator_id, code, body.due_date.isoformat()),
    )
    db.commit()
    row = db.execute("SELECT * FROM assignments WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return _row_to_dict(row, date.today())
