from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.dependencies.auth import get_current_user
from app.surveys.model import Survey
from app.surveys.schema import SurveyCreate, SurveyRead
from app.surveys.service import close_survey, create_survey, get_survey, list_surveys
from app.users.model import User
from app.utils.database import get_session

router = APIRouter(prefix="/surveys", tags=["surveys"])


@router.get("/", response_model=list[SurveyRead])
def read_surveys(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[Survey]:
    return list_surveys(session, current_user, offset=offset, limit=limit)


@router.post("/", response_model=SurveyRead, status_code=status.HTTP_201_CREATED)
def create_new_survey(
    survey_in: SurveyCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Survey:
    return create_survey(session, current_user, survey_in)


@router.get("/{survey_id}", response_model=SurveyRead)
def read_survey(
    survey_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Survey:
    survey = get_survey(session, current_user, survey_id)
    if survey is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    return survey


@router.post("/{survey_id}/close", response_model=SurveyRead)
def close_existing_survey(
    survey_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Survey:
    survey = close_survey(session, current_user, survey_id)
    if survey is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    return survey
