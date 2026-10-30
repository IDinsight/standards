from datetime import date

from tally.entries import Entry
from tally.summary import week_start, weekly_summary


def test_week_start_is_monday():
    assert week_start(date(2026, 9, 24)) == date(2026, 9, 21)


def test_totals_per_project_within_week():
    entries = [
        Entry(date(2026, 9, 21), "atlas", 50),
        Entry(date(2026, 9, 23), "atlas", 40),
        Entry(date(2026, 9, 22), "beacon", 30),
        Entry(date(2026, 9, 28), "atlas", 60),
    ]
    summary = weekly_summary(entries, date(2026, 9, 24))
    assert summary == {
        "week": "2026-09-21",
        "projects": [
            {"project": "atlas", "minutes": 90},
            {"project": "beacon", "minutes": 30},
        ],
    }
