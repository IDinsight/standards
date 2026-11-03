from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.db import get_conn
from app.signup.service import create_account

router = APIRouter(prefix="/signup", tags=["signup"])


class SignupIn(BaseModel):
    email: str = Field(max_length=254)
    display_name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=10)


class AccountOut(BaseModel):
    id: int
    email: str
    display_name: str


@router.post("", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, conn=Depends(get_conn)):
    account = create_account(conn, body.email, body.display_name, body.password)
    if account is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )
    return account
