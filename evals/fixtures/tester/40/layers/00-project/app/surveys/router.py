from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, func, select

from app.auth import get_current_user
from app.database import get_session
from app.models import Answer, Question, Survey, SurveyResponse, User

router = APIRouter(prefix="/surveys", tags=["surveys"])


class QuestionIn(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    required: bool = True


class SurveyCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    questions: list[QuestionIn] = Field(min_length=1)


class QuestionOut(BaseModel):
    id: int
    position: int
    text: str
    required: bool


class SurveyOut(BaseModel):
    id: int
    title: str
    questions: list[QuestionOut]


class QuestionResult(BaseModel):
    question_id: int
    answered: int


class SurveyResults(BaseModel):
    survey_id: int
    responses: int
    questions: list[QuestionResult]


def _owned_survey(session: Session, survey_id: int, user: User) -> Survey:
    survey = session.get(Survey, survey_id)
    if survey is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    if survey.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the survey owner")
    return survey


def _questions(session: Session, survey_id: int) -> list[Question]:
    return list(
        session.exec(select(Question).where(Question.survey_id == survey_id).order_by(Question.position))
    )


def _survey_out(survey: Survey, questions: list[Question]) -> SurveyOut:
    return SurveyOut(
        id=survey.id,
        title=survey.title,
        questions=[
            QuestionOut(id=q.id, position=q.position, text=q.text, required=q.required) for q in questions
        ],
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=SurveyOut)
def create_survey(
    body: SurveyCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    survey = Survey(owner_id=user.id, title=body.title)
    session.add(survey)
    session.flush()
    questions = [
        Question(survey_id=survey.id, position=index, text=item.text, required=item.required)
        for index, item in enumerate(body.questions, start=1)
    ]
    session.add_all(questions)
    session.commit()
    return _survey_out(survey, _questions(session, survey.id))


@router.get("/{survey_id}", response_model=SurveyOut)
def get_survey(
    survey_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    survey = _owned_survey(session, survey_id, user)
    return _survey_out(survey, _questions(session, survey.id))


@router.get("/{survey_id}/results", response_model=SurveyResults)
def get_results(
    survey_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    survey = _owned_survey(session, survey_id, user)
    total = session.exec(
        select(func.count()).select_from(SurveyResponse).where(SurveyResponse.survey_id == survey.id)
    ).one()
    answered = dict(
        session.exec(
            select(Answer.question_id, func.count())
            .join(SurveyResponse, Answer.response_id == SurveyResponse.id)
            .where(SurveyResponse.survey_id == survey.id)
            .group_by(Answer.question_id)
        ).all()
    )
    return SurveyResults(
        survey_id=survey.id,
        responses=total,
        questions=[
            QuestionResult(question_id=q.id, answered=answered.get(q.id, 0))
            for q in _questions(session, survey.id)
        ],
    )
