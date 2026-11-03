from fastapi import APIRouter, Depends, HTTPException

from app.notes.store import NoteStore, get_note_store

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", status_code=201)
def create_note(payload: dict, store: NoteStore = Depends(get_note_store)):
    text = str(payload.get("text", "")).strip()
    if not text:
        raise HTTPException(status_code=422, detail="Note text must not be empty")
    note = store.add(text)
    return {"id": note.id, "text": note.text}


@router.get("/{note_id}")
def read_note(note_id: int, store: NoteStore = Depends(get_note_store)):
    note = store.get(note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"id": note.id, "text": note.text}
