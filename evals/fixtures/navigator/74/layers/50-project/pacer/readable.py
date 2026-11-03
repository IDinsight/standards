import re

UNITS = {"d": 86400, "h": 3600, "m": 60, "s": 1}
_TOKEN = re.compile(r"\s*(\d+)\s*([dhms])\s*", re.IGNORECASE)


def parse_readable(text, default=None):
    """Return the number of seconds in a readable duration such as "1h 30m".

    Units are d, h, m and s, in any order and case. Blank text returns
    default when one is given.
    """
    stripped = text.strip()
    if not stripped:
        if default is None:
            raise ValueError("duration is empty")
        return default
    total = 0
    pos = 0
    while pos < len(stripped):
        match = _TOKEN.match(stripped, pos)
        if match is None:
            raise ValueError(f"cannot read duration {text!r} at position {pos}")
        total += int(match.group(1)) * UNITS[match.group(2).lower()]
        pos = match.end()
    return total
