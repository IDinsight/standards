"""Route handlers for listing records."""
from __future__ import annotations

from dataclasses import asdict

from records.auth import ROLES, authorize
from records.filters import parse_filter
from records.http import Request, Response, Router, json_response
from records.store import RecordStore


def register_record_routes(router: Router, store: RecordStore) -> None:
    """Register ``GET /records`` for every signed-in role."""

    def list_records(request: Request) -> Response:
        authorize(request.user, ROLES)
        records = store.find(parse_filter(request.query))
        return json_response(200, {"count": len(records), "records": [asdict(record) for record in records]})

    router.get("/records", list_records)
