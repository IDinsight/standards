from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Shipment

router = APIRouter(prefix="/shipments", tags=["shipments"])


class ShipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    reference: str
    created_at: datetime


@router.get("", response_model=list[ShipmentOut])
def list_shipments(limit: int = 50, session: Session = Depends(get_session)):
    query = select(Shipment).order_by(Shipment.created_at.desc()).limit(min(limit, 200))
    return session.scalars(query).all()


@router.get("/{shipment_id}", response_model=ShipmentOut)
def get_shipment(shipment_id: int, session: Session = Depends(get_session)):
    shipment = session.get(Shipment, shipment_id)
    if shipment is None:
        raise HTTPException(status_code=404, detail="shipment not found")
    return shipment
