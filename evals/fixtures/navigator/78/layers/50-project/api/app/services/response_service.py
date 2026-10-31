from app.persistence.repository import Repository, StoredResponse


class SurveyNotFound(Exception):
    """No survey has the requested slug."""


class SurveyClosed(Exception):
    """The survey no longer accepts responses."""


class InvalidAnswers(ValueError):
    """The submitted answers are empty after trimming."""


class ResponseService:
    def __init__(self, repo: Repository) -> None:
        self.repo = repo

    def submit(self, slug: str, respondent_ref: str, answers: dict[str, str]) -> StoredResponse:
        survey = self.repo.survey_by_slug(slug)
        if survey is None:
            raise SurveyNotFound(slug)
        if not survey.is_open:
            raise SurveyClosed(slug)
        cleaned = {key.strip(): value.strip() for key, value in answers.items() if key.strip()}
        if not cleaned:
            raise InvalidAnswers("at least one answer is required")
        stored = self.repo.add_response(survey.id, respondent_ref.strip(), cleaned)
        print(f"stored response {stored.id} for survey {slug}")
        return stored

    def responses(self, slug: str) -> list[StoredResponse]:
        survey = self.repo.survey_by_slug(slug)
        if survey is None:
            raise SurveyNotFound(slug)
        return self.repo.responses_for(survey.id)
