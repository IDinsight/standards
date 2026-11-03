"""Command line entry point: export a records dump to CSV."""

import argparse
import os
import sys
from pathlib import Path

from .csvout import to_csv
from .records import RecordsError, load_records, select

EXIT_OK = 0
EXIT_FAILURE = 1
# argparse exits with status 2 on usage errors.

STATUSES = ("active", "archived")


def build_parser():
    parser = argparse.ArgumentParser(prog="export-cli", description="Export a records dump to CSV.")
    parser.add_argument("--input", help="records dump (default: $RECORDS_FILE, then records.json)")
    parser.add_argument("--status", choices=STATUSES, help="only records with this status")
    parser.add_argument("--owner", help="only records owned by this user")
    parser.add_argument("--output", default="-", help="CSV file to write, or - for standard output (default)")
    return parser


def fail(message):
    print(f"export-cli: error: {message}", file=sys.stderr)
    return EXIT_FAILURE


def main(argv=None):
    args = build_parser().parse_args(argv)
    source = Path(args.input or os.environ.get("RECORDS_FILE") or "records.json")
    try:
        records = select(load_records(source), status=args.status, owner=args.owner)
    except RecordsError as error:
        return fail(error)
    # Build the whole CSV first so a failure never leaves a partial file.
    text = to_csv(records)
    if args.output == "-":
        sys.stdout.write(text)
        sys.stdout.flush()
        return EXIT_OK
    try:
        with open(args.output, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
    except OSError as error:
        return fail(f"cannot write {args.output}: {error.strerror}")
    print(f"wrote {len(records)} records to {args.output}", file=sys.stderr)
    return EXIT_OK


def entry():
    sys.exit(main())
