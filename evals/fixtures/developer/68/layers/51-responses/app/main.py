from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.responses.router import router as response_router
from app.surveys.router import router as survey_router
from app.utils.config import settings
from app.utils.database import engine


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    yield
    engine.dispose()


app = FastAPI(title=settings.project_name, version="0.4.0", lifespan=lifespan)
app.include_router(survey_router)
app.include_router(response_router)
