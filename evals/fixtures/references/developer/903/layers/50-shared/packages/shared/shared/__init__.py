"""Survey codes and statuses shared by the fieldwork services."""

SURVEY_STATUSES = ("draft", "open", "closed")


def normalize_code(code: str) -> str:
    """Return a survey code in its canonical form: trimmed and upper-case."""
    return code.strip().upper()


def is_valid_status(status: str) -> bool:
    return status in SURVEY_STATUSES
