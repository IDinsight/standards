from datetime import date

import pytest

from app.assignments import is_overdue, validate_household_code


def test_household_code_is_normalized():
    assert validate_household_code(" ksm04217 ") == "KSM04217"


@pytest.mark.parametrize("code", ["KS04217", "KSM0421X", "1SM04217", ""])
def test_household_code_rejects_bad_shapes(code):
    with pytest.raises(ValueError):
        validate_household_code(code)


def test_open_assignment_past_due_is_overdue():
    assert is_overdue(date(2026, 9, 1), "open", date(2026, 9, 2))


def test_visited_assignment_is_never_overdue():
    assert not is_overdue(date(2026, 9, 1), "visited", date(2026, 9, 30))
