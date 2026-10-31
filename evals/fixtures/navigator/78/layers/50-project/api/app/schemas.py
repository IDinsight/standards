from pydantic import BaseModel, Field

from app.persistence.repository import StoredResponse


class ResponseIn(BaseModel):
    respondent_ref: str = Field(min_length=1, max_length=64)
    answers: dict[str, str] = Field(min_length=1, max_length=200)


class ResponseOut(BaseModel):
    id: int
    respondent_ref: str
    answers: dict[str, str]
    submitted_at: str

    @classmethod
    def from_stored(cls, stored: StoredResponse) -> "ResponseOut":
        return cls(
            id=stored.id,
            respondent_ref=stored.respondent_ref,
            answers=stored.answers,
            submitted_at=stored.submitted_at,
        )
