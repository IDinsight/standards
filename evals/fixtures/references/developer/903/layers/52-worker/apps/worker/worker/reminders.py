from dataclasses import dataclass
from datetime import date

from shared import normalize_code


@dataclass(frozen=True)
class Assignment:
    survey_code: str
    enumerator: str
    due: date
    submitted: bool


def due_reminders(assignments: list[Assignment], today: date) -> list[str]:
    """Return one reminder line per unsubmitted assignment due on or before today."""
    lines = []
    for item in sorted(assignments, key=lambda a: (a.due, a.enumerator)):
        if not item.submitted and item.due <= today:
            code = normalize_code(item.survey_code)
            lines.append(f"{item.enumerator}: {code} due {item.due.isoformat()}")
    return lines
