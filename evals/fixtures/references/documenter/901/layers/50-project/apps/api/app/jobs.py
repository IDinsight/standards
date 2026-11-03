import csv
import os
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

MAX_UPLOAD_BYTES = 10 * 1024 * 1024

SCHEMA = """
CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY, filename TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS api_tokens (token_sha256 TEXT PRIMARY KEY, name TEXT NOT NULL);
"""


def connect(database_url: str) -> sqlite3.Connection:
    if not database_url.startswith("sqlite:///"):
        raise ValueError("DATABASE_URL must start with sqlite:///")
    db = sqlite3.connect(database_url[len("sqlite:///"):] or ":memory:", check_same_thread=False)
    db.executescript(SCHEMA)
    return db


@dataclass
class Job:
    id: str
    status: str
    created_at: str


class UploadTooLarge(Exception):
    pass


class ImportJobs:
    def __init__(self, db, settings):
        self.db = db
        self.storage_dir = settings.storage_dir

    def create(self, filename: str, data: bytes) -> Job:
        if len(data) > MAX_UPLOAD_BYTES:
            raise UploadTooLarge("file is larger than 10 MiB")
        job = Job(uuid.uuid4().hex, "running", datetime.now(timezone.utc).isoformat())
        self._store(job.id, data)
        with self.db:
            self.db.execute("INSERT INTO import_jobs (id, filename, status, created_at) VALUES (?, ?, ?, ?)",
                            (job.id, filename, job.status, job.created_at))
        return job

    def get(self, job_id: str) -> Job | None:
        row = self.db.execute("SELECT id, status, created_at FROM import_jobs WHERE id = ?", (job_id,)).fetchone()
        return Job(*row) if row else None

    def process(self, job_id: str) -> None:
        with open(self._path(job_id), encoding="utf-8", newline="") as handle:
            for _ in csv.reader(handle):
                pass
        with self.db:
            self.db.execute("UPDATE import_jobs SET status = 'done' WHERE id = ?", (job_id,))

    def _store(self, job_id: str, data: bytes) -> None:
        os.makedirs(self.storage_dir, exist_ok=True)
        with open(self._path(job_id), "wb") as handle:
            handle.write(data)

    def _path(self, job_id: str) -> str:
        return os.path.join(self.storage_dir, f"{job_id}.csv")
