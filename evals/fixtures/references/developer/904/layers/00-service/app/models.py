from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer: Mapped[str] = mapped_column(String(200))
    # Basis points: 1_000 is 10%.
    tax_rate_bp: Mapped[int] = mapped_column(default=0)
    lines: Mapped[list["InvoiceLine"]] = relationship(back_populates="invoice")


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    description: Mapped[str] = mapped_column(String(500))
    quantity: Mapped[int]
    unit_price_cents: Mapped[int]
    invoice: Mapped[Invoice] = relationship(back_populates="lines")
