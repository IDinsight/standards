from durfmt.parse import ORDER, UNITS


def format_duration(seconds, largest="d"):
    """Return a compact string such as "1h30m" for a number of seconds.

    Units with a zero amount are left out; zero itself is "0s". `largest`
    caps the biggest unit used, so format_duration(90000, largest="h") is
    "25h".
    """
    if seconds < 0:
        raise ValueError("seconds must not be negative")
    seconds = int(seconds)
    if seconds == 0:
        return "0s"
    parts = []
    for unit in ORDER[ORDER.index(largest):]:
        amount, seconds = divmod(seconds, UNITS[unit])
        if amount:
            parts.append(f"{amount}{unit}")
    return "".join(parts)
