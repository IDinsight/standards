from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ImportJob(BaseModel):
    id: str
    status: Literal["running", "done"]
    created_at: datetime


class Error(BaseModel):
    detail: str
