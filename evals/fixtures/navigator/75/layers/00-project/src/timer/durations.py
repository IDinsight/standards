"""Parse human-friendly durations into seconds."""

UNITS = {"s": 1, "m": 60, "h": 3600}
DEFAULT_UNIT = "m"


def parse_duration(text):
    """Return the number of seconds in text, such as "30s", "5m", or "2h"."""
    value = text.strip().lower()
    if not value:
        raise ValueError("empty duration")
    if value[-1] in UNITS:
        number, unit = value[:-1], value[-1]
    else:
        number, unit = value, DEFAULT_UNIT
    return int(number) * UNITS[unit]
