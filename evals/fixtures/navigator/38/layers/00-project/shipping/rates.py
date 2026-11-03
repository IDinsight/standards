import csv
from pathlib import Path

RATES_FILE = Path(__file__).resolve().parent.parent / "rates" / "zones.tsv"


def load_rates(path=RATES_FILE):
    """Return {zone: {tier: price}} from the tab-separated rate table."""
    with open(path, newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        return {
            row["zone"]: {tier: float(price) for tier, price in row.items() if tier != "zone"}
            for row in reader
        }
