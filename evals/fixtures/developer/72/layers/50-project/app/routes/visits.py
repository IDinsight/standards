from datetime import date

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import require_user
from app.data.platform import dp_session
from app.schemas import VisitRead

router = APIRouter(prefix="/visits", tags=["visits"], dependencies=[Depends(require_user)])


@router.get("/", response_model=list[VisitRead])
def list_visits(
    visit_date: date = Query(...),
    site_id: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
) -> list[VisitRead]:
    filters: dict[str, object] = {"visit_date": visit_date.isoformat(), "limit": limit}
    if site_id:
        filters["site_id"] = site_id
    with dp_session() as session:
        rows = session.fetch("visits", **filters)
    return [VisitRead(**row) for row in rows]
