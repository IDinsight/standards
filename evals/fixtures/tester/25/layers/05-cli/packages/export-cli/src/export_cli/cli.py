"""Command line entry point: export a records dump to CSV."""

import argparse
import os
import sys
from pathlib import Path

from .csvout import write_csv
from .records import load_records, select

STATUSES = ("active", "archived")


def build_parser():
    parser = argparse.ArgumentParser(prog="export-cli", description="Export a records dump to CSV.")
    parser.add_argument("--input", help="records dump (default: $RECORDS_FILE, then records.json)")
    parser.add_argument("--status", choices=STATUSES, help="only records with this status")
    parser.add_argument("--owner", help="only records owned by this user")
    parser.add_argument("--output", required=True, help="CSV file to write")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    source = Path(args.input or os.environ.get("RECORDS_FILE", "records.json"))
    records = select(load_records(source), status=args.status, owner=args.owner)
    with open(args.output, "w", encoding="utf-8", newline="") as handle:
        write_csv(handle, records)
    print(f"wrote {len(records)} records to {args.output}")
    return 0


def entry():
    sys.exit(main())
