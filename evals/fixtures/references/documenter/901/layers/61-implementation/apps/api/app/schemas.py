from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ImportJob(BaseModel):
    id: str
    status: Literal["pending", "running", "failed", "done"]
    created_at: datetime
    error: str | None = None


class Error(BaseModel):
    detail: str
