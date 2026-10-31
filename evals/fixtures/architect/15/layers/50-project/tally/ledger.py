import csv
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation


@dataclass
class Entry:
    date: str
    account: str
    amount: Decimal


class LedgerError(Exception):
    pass


def load_entries(path):
    try:
        handle = open(path, newline="", encoding="utf-8")
    except FileNotFoundError:
        raise LedgerError(f"ledger file not found: {path}") from None
    with handle:
        entries = []
        for line_no, row in enumerate(csv.DictReader(handle), start=2):
            try:
                amount = Decimal(row["amount"])
            except (InvalidOperation, KeyError, TypeError):
                raise LedgerError(f"line {line_no}: invalid amount") from None
            entries.append(Entry(row["date"], row["account"], amount))
    return entries
