from typing import Literal

from pydantic import BaseModel, Field


class SurveyCreate(BaseModel):
    code: str = Field(min_length=2, max_length=16)
    title: str = Field(min_length=1, max_length=200)


class Survey(BaseModel):
    code: str
    title: str
    status: Literal["draft", "open", "closed"]
