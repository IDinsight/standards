from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.users.model import User
from app.utils.database import SessionDep
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    user_id = decode_access_token(token)
    user = session.get(User, user_id) if user_id is not None else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
