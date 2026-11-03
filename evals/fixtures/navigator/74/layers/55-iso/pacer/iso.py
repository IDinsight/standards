import re

_PATTERN = re.compile(r"P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?")


def parse_iso(text):
    """Return the number of seconds in an ISO 8601 duration such as "PT25M"."""
    value = text.strip().upper()
    match = _PATTERN.fullmatch(value)
    if match is None or value in ("P", "PT"):
        raise ValueError(f"not an ISO 8601 duration: {text!r}")
    days, hours, minutes, seconds = (int(part or 0) for part in match.groups())
    return days * 86400 + hours * 3600 + minutes * 60 + seconds
