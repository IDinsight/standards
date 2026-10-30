import re

UNITS = {"d": 86400, "h": 3600, "m": 60, "s": 1}
ORDER = "dhms"
_TOKEN = re.compile(r"(\d+)([dhms])")


class DurationError(ValueError):
    """Raised when a duration string cannot be parsed."""


def parse(text):
    """Return the number of seconds in a duration such as "1h30m" or "45s".

    Units must appear in descending order (d, h, m, s) and at most once each.
    Spaces are ignored and letters are case-insensitive. A bare integer is
    read as seconds.
    """
    value = "".join(text.split()).lower()
    if not value:
        raise DurationError("empty duration")
    if value.isdigit():
        return int(value)
    pos = 0
    total = 0
    last = None
    for match in _TOKEN.finditer(value):
        if match.start() != pos:
            raise DurationError(f"unexpected text in {text!r}")
        amount, unit = match.groups()
        if last is not None and ORDER.index(unit) <= ORDER.index(last):
            raise DurationError(f"units out of order in {text!r}")
        total += int(amount) * UNITS[unit]
        last = unit
        pos = match.end()
    if pos != len(value) or last is None:
        raise DurationError(f"unexpected text in {text!r}")
    return total
