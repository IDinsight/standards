"""Convert the old admin tool's spreadsheet dump into data/seed.json.

The old tool wrote records as tab-separated text with the columns Ref, Title,
Owner, Archived, and Created. Run it when refreshing the seed data:

    python3 tools/convert_legacy.py legacy.tsv data/seed.json
"""

import csv
import json
import sys
from datetime import datetime, timezone


def parse_row(row):
    """Build a seed record from one legacy row.

    :param row: mapping with the legacy column names.
    :returns: dict with id, title, owner, status, and createdAt.
    :raises ValueError: if Ref is not a number or Created is not a date.
    """
    created = datetime.strptime(row["Created"].strip(), "%d/%m/%Y %H:%M").replace(tzinfo=timezone.utc)
    return {
        "id": int(row["Ref"]),
        "title": row["Title"].strip(),
        "owner": row["Owner"].strip().lower(),
        "status": "archived" if row["Archived"].strip().upper() == "Y" else "active",
        "createdAt": created.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def convert(lines):
    """Convert legacy tab-separated lines to seed records ordered by id.

    :param lines: iterable of text lines, header first.
    :returns: list of seed records.
    """
    reader = csv.DictReader(lines, delimiter="\t")
    return sorted((parse_row(row) for row in reader), key=lambda record: record["id"])


def main(argv):
    if len(argv) != 3:
        print("usage: convert_legacy.py <legacy.tsv> <seed.json>", file=sys.stderr)
        return 2
    with open(argv[1], encoding="utf-8", newline="") as source:
        records = convert(source)
    with open(argv[2], "w", encoding="utf-8") as target:
        json.dump(records, target, indent=2)
        target.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
