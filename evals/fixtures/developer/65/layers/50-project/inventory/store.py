import csv
from pathlib import Path

from inventory.models import Item


def load_items(path):
    """Read items from a CSV file with sku, name, quantity, and reorder_level columns."""
    with Path(path).open(newline="", encoding="utf-8") as handle:
        return [
            Item(
                sku=row["sku"].strip(),
                name=row["name"].strip(),
                quantity=int(row["quantity"]),
                reorder_level=int(row["reorder_level"]),
            )
            for row in csv.DictReader(handle)
        ]
