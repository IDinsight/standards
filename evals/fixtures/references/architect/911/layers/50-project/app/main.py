from fastapi import FastAPI

from app.routers import items, warehouses

app = FastAPI(title="inventory-api")
app.include_router(warehouses.router)
app.include_router(items.router)


@app.get("/health")
def health():
    return {"status": "ok"}
