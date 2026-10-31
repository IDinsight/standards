import pytest

from app.services.response_service import (
    InvalidAnswers,
    ResponseService,
    SurveyClosed,
    SurveyNotFound,
)


@pytest.fixture
def service(repo):
    repo.add_survey("intake", "Clinic intake")
    repo.add_survey("pilot", "Pilot feedback", is_open=False)
    return ResponseService(repo)


def test_submit_stores_trimmed_answers(service):
    stored = service.submit("intake", "R-17", {" q1 ": " yes "})
    assert stored.answers == {"q1": "yes"}
    assert [item.id for item in service.responses("intake")] == [stored.id]


def test_unknown_survey_is_rejected(service):
    with pytest.raises(SurveyNotFound):
        service.submit("missing", "R-1", {"q1": "yes"})


def test_closed_survey_is_rejected(service):
    with pytest.raises(SurveyClosed):
        service.submit("pilot", "R-1", {"q1": "yes"})


def test_blank_answers_are_rejected(service):
    with pytest.raises(InvalidAnswers):
        service.submit("intake", "R-1", {"  ": "yes"})
