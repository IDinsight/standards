"""SQLite storage for extracted invoice records."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS invoices (
    document_id TEXT PRIMARY KEY,
    record TEXT NOT NULL,
    saved_at TEXT NOT NULL
)
"""


class InvoiceStore:
    def __init__(self, db_path: str):
        self.db = sqlite3.connect(db_path)
        self.db.execute(SCHEMA)

    def save_invoice(self, document_id: str, record: dict) -> None:
        saved_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        with self.db:
            self.db.execute(
                "INSERT OR REPLACE INTO invoices (document_id, record, saved_at) VALUES (?, ?, ?)",
                (document_id, json.dumps(record, sort_keys=True), saved_at),
            )

    def get_invoice(self, document_id: str) -> dict | None:
        row = self.db.execute(
            "SELECT record FROM invoices WHERE document_id = ?", (document_id,)
        ).fetchone()
        return json.loads(row[0]) if row else None

    def close(self) -> None:
        self.db.close()
