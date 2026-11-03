"""Read the bank's expenses CSV export."""

import csv
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation


@dataclass(frozen=True)
class Expense:
    date: str
    category: str
    amount: Decimal


class ExpenseError(Exception):
    """A row in the export could not be read."""

    def __init__(self, line, message):
        super().__init__(f"line {line}: {message}")
        self.line = line
        self.message = message


def _parse_amount(raw, line):
    text = (raw or "").strip()
    if not text:
        raise ExpenseError(line, "missing amount")
    try:
        amount = Decimal(text)
    except InvalidOperation:
        raise ExpenseError(line, f"invalid amount {text!r}") from None
    if not amount.is_finite():
        raise ExpenseError(line, f"invalid amount {text!r}")
    return amount


def read_expenses(path):
    """Return the expenses in the CSV file at path, in file order."""
    expenses = []
    with open(path, encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            line = reader.line_num
            expenses.append(
                Expense(
                    date=(row.get("date") or "").strip(),
                    category=(row.get("category") or "").strip(),
                    amount=_parse_amount(row.get("amount"), line),
                )
            )
    return expenses
