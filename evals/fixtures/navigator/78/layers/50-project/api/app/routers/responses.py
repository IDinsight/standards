from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import get_repository, require_api_key
from app.persistence.repository import ApiKey, Repository
from app.schemas import ResponseIn, ResponseOut
from app.services.response_service import (
    InvalidAnswers,
    ResponseService,
    SurveyClosed,
    SurveyNotFound,
)

router = APIRouter(prefix="/surveys", tags=["responses"])


@router.post("/{slug}/responses", status_code=status.HTTP_201_CREATED, response_model=ResponseOut)
def submit_response(
    slug: str,
    body: ResponseIn,
    _key: ApiKey = Depends(require_api_key),
    repo: Repository = Depends(get_repository),
) -> ResponseOut:
    service = ResponseService(repo)
    try:
        stored = service.submit(slug, body.respondent_ref, body.answers)
    except SurveyNotFound as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "survey not found") from exc
    except SurveyClosed as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, "survey is closed") from exc
    except InvalidAnswers as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return ResponseOut.from_stored(stored)


@router.get("/{slug}/responses", response_model=list[ResponseOut])
def list_responses(
    slug: str,
    _key: ApiKey = Depends(require_api_key),
    repo: Repository = Depends(get_repository),
) -> list[ResponseOut]:
    try:
        stored = ResponseService(repo).responses(slug)
    except SurveyNotFound as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "survey not found") from exc
    return [ResponseOut.from_stored(item) for item in stored]
