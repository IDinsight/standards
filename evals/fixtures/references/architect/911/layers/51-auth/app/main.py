from fastapi import Depends, FastAPI

from app.auth import require_token
from app.routers import items, warehouses

app = FastAPI(title="inventory-api")
app.include_router(warehouses.router, dependencies=[Depends(require_token)])
app.include_router(items.router, dependencies=[Depends(require_token)])


@app.get("/health")
def health():
    return {"status": "ok"}
