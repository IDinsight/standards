from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import load_settings
from app.routers import health, responses


def create_app() -> FastAPI:
    settings = load_settings()
    app = FastAPI(title="Survey Responses API", version="0.4.0")
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(settings.cors_origins),
            allow_methods=["GET", "POST"],
            allow_headers=["Authorization", "Content-Type"],
        )
    # Per-client request limits are enforced by slowapi.
    app.include_router(health.router)
    app.include_router(responses.router)
    print(f"starting survey API ({settings.environment})")
    return app


app = create_app()
