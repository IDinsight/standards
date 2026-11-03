"""Account source for the partner export."""

import json
from datetime import datetime, timezone
from pathlib import Path

from partner_export.model import Account

REQUIRED = ("id", "name", "country", "status", "updated_at")


class FeedError(Exception):
    """A line of the accounts feed cannot be read."""

    def __init__(self, path, line, reason):
        super().__init__(f"{path}:{line}: {reason}")
        self.path = path
        self.line = line
        self.reason = reason


class JsonlFeedSource:
    """Accounts from the accounts feed: one JSON object per line.

    Blank lines are skipped. Each object needs the REQUIRED fields; other
    fields are ignored. `updated_at` is an ISO 8601 timestamp with a UTC
    offset, reduced to its UTC day.
    """

    def __init__(self, path):
        self.path = Path(path)

    def accounts(self):
        with self.path.open(encoding="utf-8") as handle:
            for number, text in enumerate(handle, start=1):
                if not text.strip():
                    continue
                yield self._parse(text, number)

    def _parse(self, text, number):
        try:
            item = json.loads(text)
        except json.JSONDecodeError as exc:
            raise FeedError(self.path, number, f"invalid JSON ({exc.msg})") from exc
        if not isinstance(item, dict):
            raise FeedError(self.path, number, "expected a JSON object")
        missing = [name for name in REQUIRED if name not in item]
        if missing:
            raise FeedError(self.path, number, "missing " + ", ".join(missing))
        try:
            account_id = int(item["id"])
        except (TypeError, ValueError) as exc:
            raise FeedError(self.path, number, "invalid id") from exc
        try:
            updated = datetime.fromisoformat(item["updated_at"])
        except (TypeError, ValueError) as exc:
            raise FeedError(self.path, number, "invalid updated_at") from exc
        if updated.tzinfo is None:
            raise FeedError(self.path, number, "updated_at has no UTC offset")
        return Account(
            account_id=account_id,
            name=str(item["name"]).strip(),
            country=str(item["country"]).strip().upper(),
            status=str(item["status"]).strip().lower(),
            updated_on=updated.astimezone(timezone.utc).date(),
        )
