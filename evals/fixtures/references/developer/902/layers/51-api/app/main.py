from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import notes

app = FastAPI(title="notes-api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
