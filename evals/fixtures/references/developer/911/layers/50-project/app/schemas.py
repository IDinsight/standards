from pydantic import BaseModel, Field


class ItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    summary: str = ""


class ItemRead(ItemCreate):
    id: int
