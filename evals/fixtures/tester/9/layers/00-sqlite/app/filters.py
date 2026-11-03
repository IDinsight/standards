from dataclasses import dataclass

STATUSES = ("active", "archived")


@dataclass(frozen=True)
class RecordFilter:
    status: str | None = None
    owner: str | None = None
    q: str | None = None


def parse_filter(query: dict[str, str]) -> RecordFilter:
    """Build a filter from request query parameters.

    Values are trimmed; blank values and unknown parameters are ignored. An
    unknown status raises ValueError.
    """
    values = {key: (query.get(key) or "").strip() for key in ("status", "owner", "q")}
    status = values["status"] or None
    if status is not None and status not in STATUSES:
        raise ValueError(f"unknown status: {status}")
    return RecordFilter(status=status, owner=values["owner"] or None, q=values["q"] or None)
