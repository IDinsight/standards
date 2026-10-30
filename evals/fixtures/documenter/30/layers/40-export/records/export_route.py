"""POST /records/export: administrators export the filtered records as CSV."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from records.auth import require_admin
from records.export import write_export
from records.filters import parse_filter
from records.http import Request, Response, Router
from records.store import RecordStore


@dataclass(frozen=True)
class ExportSettings:
    directory: Path
    now: Callable[[], datetime]


def register_export_routes(router: Router, store: RecordStore, settings: ExportSettings) -> None:
    """Register ``POST /records/export`` for administrators.

    The handler writes the records matching the listing filters to a CSV file
    in ``settings.directory`` and returns the same CSV with status 201.
    """

    def export_records(request: Request) -> Response:
        require_admin(request.user)
        records = store.find(parse_filter(request.query))
        exported = write_export(settings.directory, records, settings.now())
        return Response(
            201,
            {
                "content-type": "text/csv; charset=utf-8",
                "content-disposition": f'attachment; filename="{exported.name}"',
            },
            exported.csv,
        )

    router.post("/records/export", export_records)
