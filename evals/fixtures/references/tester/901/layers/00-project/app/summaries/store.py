"""Stored ticket summaries."""

import sqlite3


class SummaryStore:
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path)
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS summaries ("
            "ticket_id INTEGER PRIMARY KEY, "
            "text TEXT NOT NULL, "
            "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
        )
        self.db.commit()

    def save_summary(self, ticket_id, text):
        with self.db:
            self.db.execute(
                "INSERT INTO summaries (ticket_id, text) VALUES (?, ?) "
                "ON CONFLICT(ticket_id) DO UPDATE SET "
                "text = excluded.text, updated_at = CURRENT_TIMESTAMP",
                (ticket_id, text),
            )

    def get_summary(self, ticket_id):
        row = self.db.execute(
            "SELECT text FROM summaries WHERE ticket_id = ?", (ticket_id,)
        ).fetchone()
        return row[0] if row else None
