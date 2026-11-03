"""Queue of summary jobs, stored in SQLite."""

import sqlite3
import time

from app.summaries.service import SummaryJob


class JobScheduler:
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path)
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS summary_jobs ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "ticket_id INTEGER NOT NULL, "
            "max_tokens INTEGER NOT NULL, "
            "run_at REAL NOT NULL)"
        )
        self.db.commit()

    def schedule(self, job, *, delay_seconds, now=None):
        run_at = (time.time() if now is None else now) + delay_seconds
        with self.db:
            self.db.execute(
                "INSERT INTO summary_jobs (ticket_id, max_tokens, run_at) VALUES (?, ?, ?)",
                (job.ticket_id, job.max_tokens, run_at),
            )

    def due(self, now):
        """Remove and return the jobs whose run time has come, oldest first."""
        with self.db:
            rows = self.db.execute(
                "SELECT id, ticket_id, max_tokens FROM summary_jobs "
                "WHERE run_at <= ? ORDER BY run_at, id",
                (now,),
            ).fetchall()
            self.db.executemany(
                "DELETE FROM summary_jobs WHERE id = ?", [(row[0],) for row in rows]
            )
        return [SummaryJob(ticket_id, max_tokens) for _, ticket_id, max_tokens in rows]
