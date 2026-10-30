"""Request handlers and routing for the records service.

Handlers take the store, the signed-in user (or `None`), and the query
parameters, and return `(status, headers, body)`. The service has one route,
`GET /records`, handled by `list_records`.
"""

import json
from dataclasses import asdict

from recordsvc.auth import ROLES, HttpError, authorize
from recordsvc.filters import parse_filter
from recordsvc.seed import SEED_RECORDS
from recordsvc.store import RecordStore

__all__ = ["list_records", "App"]

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


class App:
    """The records service: a store seeded from `SEED_RECORDS` unless `records` is given."""

    def __init__(self, records=None):
        self.store = RecordStore(SEED_RECORDS if records is None else records)
        self.routes = {
            ("GET", "/records"): lambda user, query: list_records(self.store, user, query),
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
