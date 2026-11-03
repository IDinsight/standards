from app.schemas import Survey


class SurveyStore:
    """In-memory survey store keyed by canonical survey code."""

    def __init__(self) -> None:
        self._surveys: dict[str, Survey] = {}

    def all_surveys(self) -> list[Survey]:
        return sorted(self._surveys.values(), key=lambda survey: survey.code)

    def get(self, code: str) -> Survey | None:
        return self._surveys.get(code)

    def create(self, code: str, title: str) -> Survey | None:
        if code in self._surveys:
            return None
        survey = Survey(code=code, title=title.strip(), status="draft")
        self._surveys[code] = survey
        return survey

    def clear(self) -> None:
        self._surveys.clear()
