from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Item, Warehouse
from app.schemas import Adjustment, ItemIn, ItemOut

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemOut])
def list_items(warehouse_id: int | None = None, session: Session = Depends(get_session)):
    query = select(Item).order_by(Item.sku)
    if warehouse_id is not None:
        query = query.where(Item.warehouse_id == warehouse_id)
    return session.scalars(query).all()


@router.get("/{sku}", response_model=ItemOut)
def get_item(sku: str, session: Session = Depends(get_session)):
    item = session.scalar(select(Item).where(Item.sku == sku))
    if item is None:
        raise HTTPException(404, "item not found")
    return item


@router.post("", response_model=ItemOut, status_code=201)
def create_item(body: ItemIn, session: Session = Depends(get_session)):
    if session.get(Warehouse, body.warehouse_id) is None:
        raise HTTPException(422, "unknown warehouse")
    item = Item(**body.model_dump())
    session.add(item)
    session.commit()
    print(f"created item {item.sku} in warehouse {item.warehouse_id}")
    return item


@router.post("/{sku}/adjust", response_model=ItemOut)
def adjust_item(sku: str, body: Adjustment, session: Session = Depends(get_session)):
    item = session.scalar(select(Item).where(Item.sku == sku))
    if item is None:
        raise HTTPException(404, "item not found")
    if item.quantity + body.delta < 0:
        print(f"rejected adjustment for {sku}: {item.quantity} + {body.delta}")
        raise HTTPException(409, "quantity cannot go below zero")
    item.quantity += body.delta
    session.commit()
    print(f"adjusted {sku} by {body.delta} -> {item.quantity}")
    return item
