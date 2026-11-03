"""Data types for the record store."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Record:
    """One record: its id, title, owner username, status, and creation time (ISO 8601, UTC)."""

    id: int
    title: str
    owner: str
    status: str
    created_at: str
