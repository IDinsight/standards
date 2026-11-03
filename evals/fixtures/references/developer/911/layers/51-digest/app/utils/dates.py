from datetime import date, timedelta


def week_range(day: date) -> tuple[date, date]:
    """Return the Monday and Sunday of the week containing ``day``."""
    start = day - timedelta(days=day.weekday())
    return start, start + timedelta(days=6)
