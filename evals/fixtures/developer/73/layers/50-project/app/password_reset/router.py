from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.db import get_conn
from app.password_reset.service import request_reset

router = APIRouter(prefix="/password-reset", tags=["password-reset"])


class ResetRequest(BaseModel):
    email: str


@router.post("", status_code=status.HTTP_202_ACCEPTED)
def create_reset(body: ResetRequest, conn=Depends(get_conn)) -> None:
    # Same response for known and unknown addresses.
    request_reset(conn, body.email)
