from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.users.model import User
from app.utils.database import get_session
from app.utils.security import decode_token

# Tokens are issued by the accounts service; this service only verifies them.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    subject = decode_token(token)
    if subject is None or not subject.isdigit():
        raise credentials_error
    user = session.get(User, int(subject))
    if user is None or not user.is_active:
        raise credentials_error
    return user
