from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile, status

from app.auth import require_token
from app.jobs import ImportJobs, UploadTooLarge
from app.schemas import ImportJob

router = APIRouter()


def get_jobs(request: Request) -> ImportJobs:
    return request.app.state.jobs


@router.post("/imports", status_code=status.HTTP_201_CREATED, response_model=ImportJob)
async def create_import(background: BackgroundTasks, file: UploadFile = File(...),
                        jobs: ImportJobs = Depends(get_jobs)):
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "file is empty")
    try:
        job = jobs.create(file.filename or "upload.csv", data)
    except UploadTooLarge as exc:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, str(exc)) from exc
    background.add_task(jobs.process, job.id)
    return ImportJob(**vars(job))


@router.get("/imports/{import_id}", response_model=ImportJob)
def get_import(import_id: str, _: str = Depends(require_token), jobs: ImportJobs = Depends(get_jobs)):
    job = jobs.get(import_id)
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "import not found")
    return ImportJob(**vars(job))
