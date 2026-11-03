from datetime import date

import pytest

from shiftlog.parse import ShiftError, parse_line, parse_lines


def test_parse_line():
    shift = parse_line("2026-09-21 09:00-12:10")
    assert shift.day == date(2026, 9, 21)
    assert shift.minutes == 190


def test_parse_lines_skips_blank_and_comment_lines():
    shifts = parse_lines(["# note\n", "\n", "2026-09-21 09:00-10:00\n"])
    assert len(shifts) == 1


def test_rejects_end_before_start():
    with pytest.raises(ShiftError, match="line 3"):
        parse_line("2026-09-21 12:00-09:00", 3)


def test_rejects_malformed_line():
    with pytest.raises(ShiftError, match="expected"):
        parse_line("monday 9-5")
