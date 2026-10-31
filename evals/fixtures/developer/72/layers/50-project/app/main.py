from fastapi import FastAPI

from app.routes import health, visits

app = FastAPI(title="visits-api")
app.include_router(health.router)
app.include_router(visits.router)
