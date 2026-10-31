from sqlmodel import Session, col, select

from app.surveys.model import Survey
from app.surveys.schema import SurveyCreate
from app.users.model import User


def list_surveys(
    session: Session, owner: User, offset: int = 0, limit: int = 50
) -> list[Survey]:
    statement = (
        select(Survey)
        .where(col(Survey.owner_id) == owner.id)
        .order_by(col(Survey.id))
        .offset(offset)
        .limit(limit)
    )
    return list(session.exec(statement).all())


def get_survey(session: Session, owner: User, survey_id: int) -> Survey | None:
    # Scoped by owner, so another user's survey looks the same as a missing one.
    statement = select(Survey).where(
        col(Survey.id) == survey_id,
        col(Survey.owner_id) == owner.id,
    )
    return session.exec(statement).first()


def create_survey(session: Session, owner: User, survey_in: SurveyCreate) -> Survey:
    survey = Survey.model_validate(survey_in, update={"owner_id": owner.id})
    session.add(survey)
    session.commit()
    session.refresh(survey)
    return survey


def close_survey(session: Session, owner: User, survey_id: int) -> Survey | None:
    survey = get_survey(session, owner, survey_id)
    if survey is None:
        return None
    survey.is_open = False
    session.add(survey)
    session.commit()
    session.refresh(survey)
    return survey
