from fastapi import FastAPI

from app.notes.router import router as notes_router

app = FastAPI(title="notes-service")
app.include_router(notes_router)
