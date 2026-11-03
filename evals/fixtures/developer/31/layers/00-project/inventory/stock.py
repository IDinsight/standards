import csv
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Item:
    sku: str
    name: str
    quantity: int
    reorder_level: int


def load_items(path):
    """Read stock items from a CSV file."""
    with Path(path).open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [
            Item(
                sku=row["sku"],
                name=row["name"],
                quantity=int(row["quantity"]),
                reorder_level=int(row["reorder_level"]),
            )
            for row in reader
        ]


def total_units(items):
    """Return the number of units across all items."""
    return sum(item.quantity for item in items)
