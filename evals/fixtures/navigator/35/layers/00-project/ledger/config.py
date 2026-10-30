"""Runtime settings for the ledger."""
import sqlite3
from pathlib import Path

from ledger import migrations

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "ledger.sqlite3"

DEFAULTS = {
    "currency": "USD",
    "rounding": "half_even",
    "page_size": 50,
    "fiscal_year_start": "04-01",
    "allow_negative_balances": False,
}

connection = sqlite3.connect(DATABASE_PATH)
migrations.apply(connection)
