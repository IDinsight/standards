from fastapi import FastAPI

from app.core.config import settings
from app.routers import health, items

app = FastAPI(title=settings.app_name)
app.include_router(health.router)
app.include_router(items.router)
