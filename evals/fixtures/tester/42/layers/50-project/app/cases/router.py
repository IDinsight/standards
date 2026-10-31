from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.auth.deps import CurrentUser
from app.cases.model import Case
from app.utils.database import SessionDep

router = APIRouter(prefix="/cases", tags=["cases"])


class CaseRead(BaseModel):
    id: int
    title: str
    notes: str


def _owned_case(session: Session, case_id: int, user) -> Case:
    case = session.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.get("/{case_id}", response_model=CaseRead)
def get_case(case_id: int, session: SessionDep, user: CurrentUser):
    case = _owned_case(session, case_id, user)
    return CaseRead(id=case.id, title=case.title, notes=case.notes)
