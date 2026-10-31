from fastapi import APIRouter, Depends, HTTPException

from app.llm.client import LLMClient, LLMError, LLMTimeoutError, get_llm_client
from app.notes.store import NoteStore, get_note_store

router = APIRouter(prefix="/notes", tags=["notes"])

SUMMARY_TIMEOUT_DETAIL = "The summary service timed out. Please retry in a few seconds."
SUMMARY_RETRY_AFTER_SECONDS = 5


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


@router.post("/{note_id}/summary")
def summarize_note(
    note_id: int,
    store: NoteStore = Depends(get_note_store),
    llm: LLMClient = Depends(get_llm_client),
):
    note = store.get(note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        summary = llm.summarize(note.text)
    except LLMTimeoutError:
        raise HTTPException(
            status_code=503,
            detail=SUMMARY_TIMEOUT_DETAIL,
            headers={"Retry-After": str(SUMMARY_RETRY_AFTER_SECONDS)},
        ) from None
    except LLMError:
        raise HTTPException(status_code=502, detail="The summary could not be generated.") from None
    return {"note_id": note.id, "summary": summary}
