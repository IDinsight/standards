"""Query parameters to store filters."""
from __future__ import annotations

from typing import cast

from records.errors import HttpError
from records.store import RecordFilter, Status

STATUSES = ("active", "archived")


def parse_filter(query: dict[str, str]) -> RecordFilter:
    """Build a store filter from request query parameters.

    Values are trimmed; blank values and unknown parameters are ignored. A
    ``status`` other than ``active`` or ``archived`` raises HttpError(400).
    """
    status = query.get("status", "").strip()
    if status and status not in STATUSES:
        raise HttpError(400, f"unknown status: {status}")
    owner = query.get("owner", "").strip()
    q = query.get("q", "").strip()
    return RecordFilter(
        status=cast(Status, status) if status else None,
        owner=owner or None,
        q=q or None,
    )
