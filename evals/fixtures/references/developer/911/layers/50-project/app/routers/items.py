from fastapi import APIRouter, HTTPException, status

from app.schemas import ItemCreate, ItemRead
from app.services.items import store

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=list[ItemRead])
def list_items() -> list[dict]:
    return store.items()


@router.post("/", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(body: ItemCreate) -> dict:
    return store.add(body.title, body.summary)


@router.get("/{item_id}", response_model=ItemRead)
def read_item(item_id: int) -> dict:
    item = store.get(item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item
