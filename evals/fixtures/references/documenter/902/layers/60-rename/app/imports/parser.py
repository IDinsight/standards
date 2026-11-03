"""Parse uploaded CSV inventory files into rows."""

import csv
from dataclasses import dataclass

REQUIRED_COLUMNS = ("sku", "name", "quantity")


class ParseError(ValueError):
    """Raised when an uploaded file cannot be turned into import rows."""


@dataclass(frozen=True)
class ImportRow:
    line: int
    sku: str
    name: str
    quantity: int


def parse_csv(stream):
    """Return the ImportRow objects in a text stream of CSV data.

    The first line must be a header that includes sku, name, and quantity;
    other columns are ignored. Values are trimmed, rows whose sku, name, and
    quantity are all empty are skipped, and line numbers count the header as
    line 1. Raises ParseError for an empty file, a missing column, or a
    quantity that is not an integer.
    """
    reader = csv.DictReader(stream)
    if reader.fieldnames is None:
        raise ParseError("file is empty")
    missing = [column for column in REQUIRED_COLUMNS if column not in reader.fieldnames]
    if missing:
        raise ParseError(f"missing column: {', '.join(missing)}")
    return list(_read_rows(reader))


def _read_rows(reader):
    for record in reader:
        sku = (record.get("sku") or "").strip()
        name = (record.get("name") or "").strip()
        quantity = (record.get("quantity") or "").strip()
        if not (sku or name or quantity):
            continue
        try:
            value = int(quantity)
        except ValueError:
            raise ParseError(f"line {reader.line_num}: quantity must be an integer") from None
        yield ImportRow(reader.line_num, sku, name, value)
