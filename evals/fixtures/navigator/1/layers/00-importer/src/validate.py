"""Row validation for transaction CSV files."""
from datetime import date
from decimal import Decimal, InvalidOperation

REQUIRED = ("id", "date", "account", "amount")


class RowError(ValueError):
    """A CSV row that cannot be imported."""


def parse_row(raw):
    """Turn a csv.DictReader row into a tuple ready for the transactions table.

    Returns (id, date, account, amount, memo). Raises RowError when a required
    column is empty, the date is not ISO 8601, or the amount is not a number.
    """
    missing = [name for name in REQUIRED if not (raw.get(name) or "").strip()]
    if missing:
        raise RowError("missing " + ", ".join(missing))
    try:
        when = date.fromisoformat(raw["date"].strip())
    except ValueError:
        raise RowError(f"bad date {raw['date']!r}") from None
    try:
        amount = Decimal(raw["amount"].strip())
    except InvalidOperation:
        raise RowError(f"bad amount {raw['amount']!r}") from None
    memo = (raw.get("memo") or "").strip()
    return (raw["id"].strip(), when.isoformat(), raw["account"].strip(), str(amount), memo)
