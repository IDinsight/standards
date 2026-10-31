from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResponseCreate(BaseModel):
    respondent_ref: str = Field(min_length=1, max_length=100)
    answers: dict[str, str]


class ResponseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    survey_id: int
    respondent_ref: str
    answers: dict[str, str]
    submitted_at: datetime
