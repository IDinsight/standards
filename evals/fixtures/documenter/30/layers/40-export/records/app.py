"""Application wiring: the record store and its routes."""
from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from records.export_route import ExportSettings, register_export_routes
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


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_app(
    records: Iterable[RecordItem] | None = None,
    export_dir: str | Path = "exports",
    now: Callable[[], datetime] | None = None,
) -> App:
    """Build the app around an in-memory store holding ``records``.

    ``records`` defaults to the seed records. Export files go to
    ``export_dir`` (a relative path resolves against the working directory);
    ``now`` supplies the export time and defaults to the current UTC time.
    """
    store = RecordStore(SEED_RECORDS if records is None else records)
    router = Router()
    register_record_routes(router, store)
    register_export_routes(router, store, ExportSettings(Path(export_dir), now or _utc_now))
    return App(store, router)
