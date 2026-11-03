"""Request handlers and routing for the records service.

Handlers take the store, the signed-in user (or `None`), and the query
parameters, and return `(status, headers, body)`. The service has one route,
`GET /records`, handled by `list_records`.
"""

import json
from dataclasses import asdict
from datetime import datetime, timezone

from recordsvc.auth import ROLES, HttpError, authorize, require_admin
from recordsvc.export import write_export
from recordsvc.filters import parse_filter
from recordsvc.seed import SEED_RECORDS
from recordsvc.store import RecordStore

__all__ = ["list_records", "export_records", "App"]

JSON_HEADERS = {"content-type": "application/json; charset=utf-8"}


def json_response(status, data):
    return status, dict(JSON_HEADERS), json.dumps(data)


def list_records(store, user, query):
    """Return the records matching `query` as JSON to any signed-in role.

    The body is `{"count": n, "records": [...]}` with records ordered by `id`.
    `query` accepts `status`, `owner`, and `q` (see `parse_filter`).
    """
    authorize(user, ROLES)
    records = store.list(**parse_filter(query))
    return json_response(200, {"count": len(records), "records": [asdict(record) for record in records]})


def export_records(store, user, query, export_dir, now):
    """Write the records matching `query` to a CSV file and return the CSV.

    Uses the same filters as `list_records`. The file is written to
    `export_dir/export-<YYYY-MM-DD>.csv` and the response is 200 with the CSV
    as the body.
    """
    require_admin(user)
    records = store.list(**parse_filter(query))
    file_name, _, csv = write_export(export_dir, records, now)
    headers = {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": f'attachment; filename="{file_name}"',
    }
    return 201, headers, csv


def utc_now():
    return datetime.now(timezone.utc)


class App:
    """The records service: a store seeded from `SEED_RECORDS` unless `records` is given.

    Exports are written under `export_dir` (relative to the working directory)
    and named from the UTC time returned by `now`.
    """

    def __init__(self, records=None, export_dir="exports", now=None):
        self.store = RecordStore(SEED_RECORDS if records is None else records)
        self.export_dir = export_dir
        self.now = now or utc_now
        self.routes = {
            ("GET", "/records"): lambda user, query: list_records(self.store, user, query),
            ("POST", "/records/export"): lambda user, query: export_records(
                self.store, user, query, self.export_dir, self.now()
            ),
        }

    def handle(self, method, path, user, query):
        """Route a request and return `(status, headers, body)`.

        An unknown path returns 404 and a known path with another method 405. An
        `HttpError` raised by a handler becomes its status with a JSON `{"error": ...}`
        body.
        """
        handler = self.routes.get((method, path))
        if handler is None:
            if any(route_path == path for _, route_path in self.routes):
                return json_response(405, {"error": "method not allowed"})
            return json_response(404, {"error": "not found"})
        try:
            return handler(user, query)
        except HttpError as error:
            return json_response(error.status, {"error": error.message})
