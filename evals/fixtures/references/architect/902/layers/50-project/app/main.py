from fastapi import Depends, FastAPI
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Entry

app = FastAPI(title="ledger-api")


class EntryIn(BaseModel):
    account: str
    amount_cents: int
    memo: str | None = None


class EntryOut(EntryIn):
    id: int


def to_out(entry: Entry) -> EntryOut:
    return EntryOut(
        id=entry.id,
        account=entry.account,
        amount_cents=entry.amount_cents,
        memo=entry.memo,
    )


@app.get("/health")
def health(session: Session = Depends(get_session)):
    session.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.post("/entries", status_code=201, response_model=EntryOut)
def create_entry(body: EntryIn, session: Session = Depends(get_session)):
    entry = Entry(**body.model_dump())
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return to_out(entry)


@app.get("/accounts/{account}/entries", response_model=list[EntryOut])
def list_entries(account: str, session: Session = Depends(get_session)):
    rows = session.scalars(
        select(Entry).where(Entry.account == account).order_by(Entry.id)
    ).all()
    return [to_out(row) for row in rows]
