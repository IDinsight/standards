"""Query parameter parsing shared by the handlers."""

from recordsvc.auth import HttpError
from recordsvc.store import STATUSES

__all__ = ["parse_filter"]


def parse_filter(query):
    """Build `RecordStore.list` keyword arguments from query parameters.

    Values are trimmed; blank values and unknown parameters are ignored. A
    `status` other than `active` or `archived` raises `HttpError(400)`.
    """
    result = {}
    status = (query.get("status") or "").strip()
    if status:
        if status not in STATUSES:
            raise HttpError(400, f"unknown status: {status}")
        result["status"] = status
    for name in ("owner", "q"):
        value = (query.get(name) or "").strip()
        if value:
            result[name] = value
    return result
