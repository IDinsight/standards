from datetime import UTC, datetime

from sqlalchemy import JSON, Column, DateTime
from sqlmodel import Field, SQLModel


class SurveyResponse(SQLModel, table=True):
    __tablename__ = "survey_responses"

    id: int | None = Field(default=None, primary_key=True)
    survey_id: int = Field(foreign_key="surveys.id", index=True)
    respondent_ref: str = Field(max_length=100)
    answers: dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    submitted_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
