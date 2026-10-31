from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.cases.router import router as cases_router

app = FastAPI(title="Casebook API")
app.include_router(auth_router)
app.include_router(cases_router)
