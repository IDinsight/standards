from datetime import date

import pytest

from tally.entries import parse_row


def test_parse_row_strips_project_name():
    entry = parse_row({"date": "2026-09-22", "project": " beacon ", "minutes": "45"})
    assert entry.day == date(2026, 9, 22)
    assert entry.project == "beacon"
    assert entry.minutes == 45


def test_parse_row_rejects_negative_minutes():
    with pytest.raises(ValueError):
        parse_row({"date": "2026-09-22", "project": "beacon", "minutes": "-5"})
