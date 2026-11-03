from fastapi import FastAPI

from app.config import Settings, load_settings
from app.jobs import ImportJobs, connect
from app.routes import imports


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or load_settings()
    app = FastAPI(title="datahub API", version="0.4.0")
    app.state.db = connect(settings.database_url)
    app.state.jobs = ImportJobs(app.state.db, settings)
    app.include_router(imports.router)
    return app


app = create_app()
