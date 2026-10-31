"""Load paper survey responses from a CSV export of the field forms."""

import csv
import sys

from sqlmodel import Session, select

from app.models import Answer, Question, SurveyResponse, User


def import_responses(session: Session, survey_id: int, rows, submitted_by: User) -> int:
    """Create one response per row. Columns are question ids; empty cells are skipped."""
    question_ids = set(session.exec(select(Question.id).where(Question.survey_id == survey_id)).all())
    count = 0
    for row in rows:
        response = SurveyResponse(survey_id=survey_id, submitted_by_id=submitted_by.id, source="import")
        session.add(response)
        session.flush()
        for column, value in row.items():
            if value and int(column) in question_ids:
                session.add(Answer(response_id=response.id, question_id=int(column), value=value.strip()))
        count += 1
    session.commit()
    return count


def main(argv: list[str]) -> None:
    from app.database import engine

    survey_id, path, email = int(argv[0]), argv[1], argv[2]
    with Session(engine) as session, open(path, newline="") as handle:
        user = session.exec(select(User).where(User.email == email)).one()
        imported = import_responses(session, survey_id, csv.DictReader(handle), user)
    print(f"{imported} responses imported")


if __name__ == "__main__":
    main(sys.argv[1:])
