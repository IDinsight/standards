from dataclasses import asdict

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_session
from app.invoices import Line, compute_totals
from app.models import Invoice

app = FastAPI(title="billing-api")


class TotalsRead(BaseModel):
    invoice_id: int
    subtotal_cents: int
    tax_cents: int
    total_cents: int


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/invoices/{invoice_id}/totals", response_model=TotalsRead)
def invoice_totals(invoice_id: int, session: Session = Depends(get_session)) -> TotalsRead:
    invoice = session.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    lines = [Line(line.quantity, line.unit_price_cents) for line in invoice.lines]
    totals = compute_totals(lines, invoice.tax_rate_bp)
    return TotalsRead(invoice_id=invoice.id, **asdict(totals))
