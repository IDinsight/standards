"""ASGI entry point."""

from fastapi import FastAPI

from app.routers import auth

app = FastAPI(title="accounts-api")
app.include_router(auth.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
