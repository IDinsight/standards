from datetime import date

from worker.reminders import Assignment, due_reminders


def test_only_unsubmitted_due_assignments() -> None:
    today = date(2026, 9, 1)
    assignments = [
        Assignment("hh-24", "Asha", date(2026, 8, 30), submitted=False),
        Assignment("hh-24", "Ben", date(2026, 8, 30), submitted=True),
        Assignment("fac-01", "Chidi", date(2026, 9, 5), submitted=False),
    ]
    assert due_reminders(assignments, today) == ["Asha: HH-24 due 2026-08-30"]


def test_sorted_by_due_date_then_name() -> None:
    today = date(2026, 9, 10)
    assignments = [
        Assignment("a", "Zoe", date(2026, 9, 2), submitted=False),
        Assignment("b", "Amir", date(2026, 9, 2), submitted=False),
        Assignment("c", "Lena", date(2026, 9, 1), submitted=False),
    ]
    assert due_reminders(assignments, today) == [
        "Lena: C due 2026-09-01",
        "Amir: B due 2026-09-02",
        "Zoe: A due 2026-09-02",
    ]
