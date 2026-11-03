from fastapi import FastAPI

from app.surveys.router import router as surveys_router

app = FastAPI(title="Survey service")
app.include_router(surveys_router)
