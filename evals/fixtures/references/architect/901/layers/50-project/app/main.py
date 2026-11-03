from fastapi import FastAPI
from sqlalchemy import text

from app.db import engine
from app.routes import shipments

app = FastAPI(title="shipments-api")
app.include_router(shipments.router)


@app.get("/health")
def health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}
