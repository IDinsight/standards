"""FastAPI application and HTTP routes."""

from fastapi import FastAPI, File, HTTPException, UploadFile

from app.imports.parser import ParseError
from app.imports.service import ImportService
from app.settings import load_settings
from app.storage import ImportStore, sqlite_path

settings = load_settings()
store = ImportStore(sqlite_path(settings.database_url))
service = ImportService(store, settings.upload_dir)

app = FastAPI(title="imports-api", version="0.3.0")


@app.post("/imports", status_code=201)
async def create_import(file: UploadFile = File(...)):
    content = await file.read()
    try:
        return service.create(file.filename or "upload.csv", content)
    except ParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.get("/imports/{import_id}")
def read_import(import_id: str):
    record = service.get(import_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Import not found")
    return record
