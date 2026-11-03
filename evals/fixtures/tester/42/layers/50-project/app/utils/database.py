from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, create_engine

from app.utils.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
