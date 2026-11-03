"""Application wiring: the record store and its routes."""
from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass

from records.http import Request, Response, Router
from records.routes import register_record_routes
from records.seed import SEED_RECORDS
from records.store import RecordItem, RecordStore


@dataclass
class App:
    store: RecordStore
    router: Router

    def handle(self, request: Request) -> Response:
        return self.router.handle(request)


def create_app(records: Iterable[RecordItem] | None = None) -> App:
    """Build the app around an in-memory store holding ``records``.

    ``records`` defaults to the seed records.
    """
    store = RecordStore(SEED_RECORDS if records is None else records)
    router = Router()
    register_record_routes(router, store)
    return App(store, router)
