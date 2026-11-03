"""Login endpoint."""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_user_repository
from app.services.auth import authenticate_user
from app.services.tokens import issue_token
from app.services.users import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(
    body: LoginRequest,
    request: Request,
    users: UserRepository = Depends(get_user_repository),
) -> TokenResponse:
    client_ip = request.client.host if request.client else "unknown"
    user = authenticate_user(body.email, body.password, client_ip=client_ip, users=users)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = issue_token(
        user.id, secret=settings.token_secret, ttl_seconds=settings.token_ttl_seconds
    )
    return TokenResponse(access_token=token)
