"""User repository backed by SQLAlchemy, used in production."""

from sqlalchemy import Integer, String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

from app.services.users import User


class Base(DeclarativeBase):
    pass


class UserRow(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))


class SqlUserRepository:
    def __init__(self, url: str) -> None:
        self._engine = create_engine(url)

    def get_by_email(self, email: str) -> User | None:
        statement = select(UserRow).where(UserRow.email == email.strip().lower())
        with Session(self._engine) as session:
            row = session.scalar(statement)
            if row is None:
                return None
            return User(id=row.id, email=row.email, password_hash=row.password_hash)
