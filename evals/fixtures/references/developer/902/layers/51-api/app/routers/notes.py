from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.config import settings
from app.deps import current_user_id
from app.services.notes import NoteStore
from app.utils.pagination import clamp_page

router = APIRouter(prefix="/notes", tags=["notes"])
store = NoteStore()


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(default="", max_length=10_000)


class NoteOut(BaseModel):
    id: int
    title: str
    body: str
    created_at: str


@router.get("/", response_model=list[NoteOut])
def list_notes(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1),
    user_id: str = Depends(current_user_id),
) -> list[dict]:
    offset, limit = clamp_page(offset, limit, settings.page_size_max)
    return [note.as_dict() for note in store.list_for(user_id, offset=offset, limit=limit)]


@router.get("/{note_id}", response_model=NoteOut)
def read_note(note_id: int, user_id: str = Depends(current_user_id)) -> dict:
    note = store.get(user_id, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note.as_dict()


@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteIn, user_id: str = Depends(current_user_id)) -> dict:
    try:
        note = store.create(user_id, payload.title, payload.body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    return note.as_dict()


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, user_id: str = Depends(current_user_id)) -> None:
    if not store.delete(user_id, note_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
