import csv
from decimal import Decimal, InvalidOperation

REQUIRED_COLUMNS = ("date", "category", "amount")


class LedgerError(Exception):
    """Raised when a file cannot be read as an expense ledger."""


def load_rows(path):
    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        missing = [name for name in REQUIRED_COLUMNS if name not in (reader.fieldnames or [])]
        if missing:
            raise LedgerError(f"missing column(s): {', '.join(missing)}")
        rows = []
        for number, row in enumerate(reader, start=2):
            try:
                amount = Decimal(row["amount"])
            except InvalidOperation:
                raise LedgerError(f"line {number}: amount {row['amount']!r} is not a number") from None
            rows.append({"date": row["date"], "category": (row["category"] or "").strip(), "amount": amount})
        return rows


def blank_categories(rows):
    return [line for line, row in enumerate(rows, start=2) if not row["category"]]


def totals(rows, by="category"):
    result = {}
    for row in rows:
        key = row["category"] if by == "category" else row["date"][:7]
        result[key] = result.get(key, Decimal("0")) + row["amount"]
    return dict(sorted(result.items()))
