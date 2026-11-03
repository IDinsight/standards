from datetime import date, time

from shiftlog.parse import Shift
from shiftlog.report import billable_minutes, daily_hours, format_week


def test_billable_minutes():
    assert billable_minutes(60) == 60
    assert billable_minutes(61) == 75
    assert billable_minutes(74) == 75


def test_daily_hours_sums_shifts_per_day():
    shifts = [
        Shift(date(2026, 9, 21), time(8, 0), time(10, 0)),
        Shift(date(2026, 9, 21), time(13, 0), time(14, 0)),
    ]
    assert daily_hours(shifts) == {date(2026, 9, 21): 3.0}


def test_format_week_total_line():
    shifts = [Shift(date(2026, 9, 21), time(8, 0), time(9, 30))]
    assert format_week(shifts).splitlines() == ["2026-09-21  1.50", "Total       1.50"]
