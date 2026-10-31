from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import init_db
from app.password_reset.router import router as password_reset_router
from app.signup.router import router as signup_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db().close()
    yield


app = FastAPI(title="Fieldbook API", lifespan=lifespan)
app.include_router(signup_router)
app.include_router(password_reset_router)
