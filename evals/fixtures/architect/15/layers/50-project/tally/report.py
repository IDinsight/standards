from decimal import Decimal


def summarize(entries, account=None):
    totals = {}
    for entry in entries:
        if account is not None and entry.account != account:
            continue
        totals[entry.account] = totals.get(entry.account, Decimal("0")) + entry.amount
    return [(name, totals[name]) for name in sorted(totals)]


def write_report(rows, out):
    for name, total in rows:
        out.write(f"{name}\t{total:.2f}\n")
