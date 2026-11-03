from dataclasses import dataclass
from datetime import date, time


class ShiftError(ValueError):
    """A line in a shift file could not be read."""


@dataclass(frozen=True)
class Shift:
    day: date
    start: time
    end: time

    @property
    def minutes(self):
        return (self.end.hour * 60 + self.end.minute) - (self.start.hour * 60 + self.start.minute)


def parse_line(line, number=1):
    text = line.strip()
    try:
        day_text, span = text.split(" ", 1)
        start_text, end_text = span.strip().split("-", 1)
        day = date.fromisoformat(day_text)
        start = time.fromisoformat(start_text)
        end = time.fromisoformat(end_text)
    except ValueError as exc:
        raise ShiftError(f"line {number}: expected 'YYYY-MM-DD HH:MM-HH:MM', got {text!r}") from exc
    if end <= start:
        raise ShiftError(f"line {number}: shift must end after it starts")
    return Shift(day, start, end)


def parse_lines(lines):
    shifts = []
    for number, line in enumerate(lines, start=1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        shifts.append(parse_line(line, number))
    return shifts
