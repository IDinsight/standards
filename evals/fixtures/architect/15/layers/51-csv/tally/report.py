import csv
from decimal import Decimal

HEADER = ["account", "entries", "total"]


def summarize(entries, account=None):
    totals = {}
    counts = {}
    for entry in entries:
        if account is not None and entry.account != account:
            continue
        totals[entry.account] = totals.get(entry.account, Decimal("0")) + entry.amount
        counts[entry.account] = counts.get(entry.account, 0) + 1
    return [(name, counts[name], totals[name]) for name in sorted(totals)]


def write_report(rows, out):
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(HEADER)
    for name, count, total in rows:
        writer.writerow([name, count, f"{total:.2f}"])
