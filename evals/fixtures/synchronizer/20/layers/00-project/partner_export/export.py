"""Builds the partner file from account records."""

import csv
from pathlib import Path

HEADER = ("account_id", "name", "country", "updated_on")


def export_rows(accounts):
    """Rows for the partner file: active accounts ordered by id."""
    active = [account for account in accounts if account.status == "active"]
    active.sort(key=lambda account: account.account_id)
    return [
        (account.account_id, account.name, account.country, account.updated_on.isoformat())
        for account in active
    ]


def write_export(accounts, out_path):
    """Write the partner file and return its path."""
    out_path = Path(out_path)
    with out_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(HEADER)
        writer.writerows(export_rows(accounts))
    return out_path
