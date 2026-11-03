import os

from sqlmodel import Session, create_engine

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+psycopg://surveys:surveys@localhost:5432/surveys"
)

engine = create_engine(DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session
