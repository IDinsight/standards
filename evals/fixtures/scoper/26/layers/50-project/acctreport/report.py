import csv
import io
import json
from decimal import Decimal

COLUMNS = ["account_id", "name", "balance"]


def load_ledger(handle):
    return list(csv.DictReader(handle))


def summarize(entries):
    totals = {}
    names = {}
    for entry in entries:
        account = entry["account_id"]
        totals[account] = totals.get(account, Decimal("0")) + Decimal(entry["amount"])
        names[account] = entry["name"]
    return [
        {"account_id": account, "name": names[account], "balance": f"{totals[account]:.2f}"}
        for account in sorted(totals)
    ]


def to_csv(rows):
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=COLUMNS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return out.getvalue()


def to_json(rows):
    return json.dumps({"count": len(rows), "accounts": rows}, indent=2) + "\n"
