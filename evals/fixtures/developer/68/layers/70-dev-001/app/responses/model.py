from datetime import UTC, datetime

from sqlalchemy import JSON, Column, DateTime, Index
from sqlmodel import Field, SQLModel


class SurveyResponse(SQLModel, table=True):
    __tablename__ = "survey_responses"
    # Serves per-survey pages in submission order; also covers lookups by survey_id alone.
    __table_args__ = (
        Index("ix_survey_responses_survey_id_submitted_at", "survey_id", "submitted_at"),
    )

    id: int | None = Field(default=None, primary_key=True)
    survey_id: int = Field(foreign_key="surveys.id")
    respondent_ref: str = Field(max_length=100)
    answers: dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    submitted_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
