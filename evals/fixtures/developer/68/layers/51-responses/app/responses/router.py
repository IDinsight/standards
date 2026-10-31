from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.responses.model import SurveyResponse
from app.responses.schema import ResponseCreate, ResponseRead
from app.responses.service import submit_response
from app.utils.database import get_session

router = APIRouter(prefix="/surveys/{survey_id}/responses", tags=["responses"])


@router.post("/", response_model=ResponseRead, status_code=status.HTTP_201_CREATED)
def submit_survey_response(
    survey_id: int,
    response_in: ResponseCreate,
    session: Session = Depends(get_session),
) -> SurveyResponse:
    # Respondents are anonymous: submitting needs no token, only an open survey.
    response = submit_response(session, survey_id, response_in)
    if response is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found or closed"
        )
    return response
