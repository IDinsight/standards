"""Batch import of transaction CSV files into a SQLite ledger."""
import csv
import sqlite3
from dataclasses import dataclass, field

from validate import RowError, parse_row

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    account TEXT NOT NULL,
    amount TEXT NOT NULL,
    memo TEXT NOT NULL DEFAULT ''
)
"""

INSERT = "INSERT OR REPLACE INTO transactions (id, date, account, amount, memo) VALUES (?, ?, ?, ?, ?)"


@dataclass
class ImportResult:
    imported: int = 0
    rejected: int = 0
    errors: list = field(default_factory=list)


def read_rows(path):
    """Yield (line number, row dict) for each data row; line 1 is the header."""
    with open(path, newline="", encoding="utf-8") as handle:
        for line_no, row in enumerate(csv.DictReader(handle), start=2):
            yield line_no, row


def import_batch(paths, db_path="ledger.db", batch_size=500, dry_run=False):
    """Validate and import every row of the given CSV files.

    Valid rows are written in transactions of batch_size rows. Invalid rows are
    counted and described in the result instead of stopping the import. With
    dry_run the database is never opened.
    """
    result = ImportResult()
    db = None if dry_run else sqlite3.connect(db_path)
    try:
        if db is not None:
            db.execute(SCHEMA)
        pending = []
        for path in paths:
            for line_no, raw in read_rows(path):
                try:
                    pending.append(parse_row(raw))
                except RowError as exc:
                    result.rejected += 1
                    result.errors.append(f"{path}:{line_no}: {exc}")
                    continue
                if len(pending) >= batch_size:
                    result.imported += _flush(db, pending)
        result.imported += _flush(db, pending)
    finally:
        if db is not None:
            db.close()
    return result


def _flush(db, pending):
    count = len(pending)
    if db is not None and pending:
        with db:
            db.executemany(INSERT, pending)
    pending.clear()
    return count
