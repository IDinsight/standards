import csv
import hashlib
import os
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY, filename TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS api_tokens (token_sha256 TEXT PRIMARY KEY, name TEXT NOT NULL);
"""
# Columns added after the first release; connect() adds them to older databases.
ADDED_COLUMNS = ("error", "idempotency_key", "file_sha256")


def connect(database_url: str) -> sqlite3.Connection:
    if not database_url.startswith("sqlite:///"):
        raise ValueError("DATABASE_URL must start with sqlite:///")
    db = sqlite3.connect(database_url[len("sqlite:///"):] or ":memory:", check_same_thread=False)
    db.executescript(SCHEMA)
    present = {row[1] for row in db.execute("PRAGMA table_info(import_jobs)")}
    for name in ADDED_COLUMNS:
        if name not in present:
            db.execute(f"ALTER TABLE import_jobs ADD COLUMN {name} TEXT")
    db.execute("CREATE UNIQUE INDEX IF NOT EXISTS import_jobs_key ON import_jobs (idempotency_key)"
               " WHERE idempotency_key IS NOT NULL")
    db.commit()
    return db


@dataclass
class Job:
    id: str
    status: str
    created_at: str
    error: str | None = None


class UploadTooLarge(Exception):
    pass


class IdempotencyConflict(Exception):
    pass


class ImportJobs:
    def __init__(self, db, settings):
        self.db = db
        self.storage_dir = settings.storage_dir
        self.max_bytes = settings.import_max_bytes

    def create(self, filename: str, data: bytes, key: str | None = None) -> tuple[Job, bool]:
        """Create a pending job; for a known key, return its job and False instead."""
        if len(data) > self.max_bytes:
            raise UploadTooLarge(f"file is larger than {self.max_bytes} bytes")
        digest = hashlib.sha256(data).hexdigest()
        if key is not None:
            row = self.db.execute("SELECT id, file_sha256 FROM import_jobs WHERE idempotency_key = ?",
                                  (key,)).fetchone()
            if row is not None:
                if row[1] != digest:
                    raise IdempotencyConflict("Idempotency-Key was already used with a different file")
                return self.get(row[0]), False
        job = Job(uuid.uuid4().hex, "pending", datetime.now(timezone.utc).isoformat())
        self._store(job.id, data)
        with self.db:
            self.db.execute(
                "INSERT INTO import_jobs (id, filename, status, created_at, idempotency_key, file_sha256)"
                " VALUES (?, ?, ?, ?, ?, ?)", (job.id, filename, job.status, job.created_at, key, digest))
        return job, True

    def get(self, job_id: str) -> Job | None:
        row = self.db.execute("SELECT id, status, created_at, error FROM import_jobs WHERE id = ?",
                              (job_id,)).fetchone()
        return Job(*row) if row else None

    def process(self, job_id: str) -> None:
        self._set(job_id, "running")
        try:
            with open(self._path(job_id), encoding="utf-8", newline="") as handle:
                if not any(True for _ in csv.reader(handle)):
                    raise ValueError("file has no rows")
        except (OSError, UnicodeDecodeError, csv.Error, ValueError) as exc:
            self._set(job_id, "failed", str(exc))
            return
        self._set(job_id, "done")

    def _set(self, job_id: str, status: str, error: str | None = None) -> None:
        with self.db:
            self.db.execute("UPDATE import_jobs SET status = ?, error = ? WHERE id = ?", (status, error, job_id))

    def _store(self, job_id: str, data: bytes) -> None:
        os.makedirs(self.storage_dir, exist_ok=True)
        with open(self._path(job_id), "wb") as handle:
            handle.write(data)

    def _path(self, job_id: str) -> str:
        return os.path.join(self.storage_dir, f"{job_id}.csv")
