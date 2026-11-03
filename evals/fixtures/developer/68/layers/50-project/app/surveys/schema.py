from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SurveyCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class SurveyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    title: str
    is_open: bool
    created_at: datetime
