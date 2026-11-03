from sqlmodel import Session

from app.responses.model import SurveyResponse
from app.responses.schema import ResponseCreate
from app.surveys.model import Survey


def submit_response(
    session: Session, survey_id: int, response_in: ResponseCreate
) -> SurveyResponse | None:
    survey = session.get(Survey, survey_id)
    if survey is None or not survey.is_open:
        return None
    response = SurveyResponse.model_validate(response_in, update={"survey_id": survey_id})
    session.add(response)
    session.commit()
    session.refresh(response)
    return response
