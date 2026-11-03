from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str


class ApiToken(SQLModel, table=True):
    __tablename__ = "api_tokens"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    token_hash: str = Field(unique=True)


class Survey(SQLModel, table=True):
    __tablename__ = "surveys"

    id: int | None = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id", index=True)
    title: str
    created_at: datetime = Field(default_factory=utcnow)


class Question(SQLModel, table=True):
    __tablename__ = "questions"

    id: int | None = Field(default=None, primary_key=True)
    survey_id: int = Field(foreign_key="surveys.id", index=True)
    position: int
    text: str
    required: bool = True


class SurveyResponse(SQLModel, table=True):
    __tablename__ = "survey_responses"

    id: int | None = Field(default=None, primary_key=True)
    survey_id: int = Field(foreign_key="surveys.id", index=True)
    submitted_by_id: int = Field(foreign_key="users.id")
    submitted_at: datetime = Field(default_factory=utcnow)
    source: str = "import"


class Answer(SQLModel, table=True):
    __tablename__ = "answers"

    id: int | None = Field(default=None, primary_key=True)
    response_id: int = Field(foreign_key="survey_responses.id", index=True)
    question_id: int = Field(foreign_key="questions.id")
    value: str
