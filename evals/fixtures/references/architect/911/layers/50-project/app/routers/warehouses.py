from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Warehouse
from app.schemas import WarehouseIn, WarehouseOut

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.get("", response_model=list[WarehouseOut])
def list_warehouses(session: Session = Depends(get_session)):
    return session.scalars(select(Warehouse).order_by(Warehouse.code)).all()


@router.post("", response_model=WarehouseOut, status_code=201)
def create_warehouse(body: WarehouseIn, session: Session = Depends(get_session)):
    warehouse = Warehouse(**body.model_dump())
    session.add(warehouse)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, "warehouse code already exists")
    print(f"created warehouse {warehouse.code}")
    return warehouse
