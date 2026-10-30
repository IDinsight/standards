"""Command-line interface for recordbook.

Commands:

- ``list``: print the records that match the filters.
"""

import argparse
import json
import os
import sys
from dataclasses import asdict

from recordbook.export import default_export_path, write_export
from recordbook.store import STATUSES, filter_records, load_records

DEFAULT_DATA = "data/records.json"
DEFAULT_EXPORT_DIR = "exports"


def add_filter_options(parser):
    """Add the --status, --owner, and --query options shared by commands."""
    parser.add_argument("--status", choices=STATUSES, help="only records with this status")
    parser.add_argument("--owner", help="only records owned by this user")
    parser.add_argument("-q", "--query", help="case-insensitive text that must appear in the title")


def build_parser():
    parser = argparse.ArgumentParser(prog="recordbook", description="Work with the records file.")
    parser.add_argument(
        "--data",
        default=os.environ.get("RECORDBOOK_DATA", DEFAULT_DATA),
        help="records JSON file (default: $RECORDBOOK_DATA or data/records.json)",
    )
    commands = parser.add_subparsers(dest="command", required=True)
    list_parser = commands.add_parser("list", help="print matching records")
    add_filter_options(list_parser)
    list_parser.add_argument("--json", action="store_true", help="print a JSON array instead of a table")

    export_parser = commands.add_parser("export", help="write matching records to a CSV file")
    add_filter_options(export_parser)
    export_parser.add_argument(
        "-o", "--output", help="CSV file to write (default: a timestamped file in the export folder)"
    )
    export_parser.add_argument(
        "--export-dir",
        default=os.environ.get("RECORDBOOK_EXPORT_DIR", DEFAULT_EXPORT_DIR),
        help="folder for timestamped exports (default: $RECORDBOOK_EXPORT_DIR or exports)",
    )
    export_parser.add_argument("--force", action="store_true", help="replace the output file if it already exists")
    return parser


def cmd_list(args, out):
    """Print the matching records as a table, or as JSON with --json."""
    records = filter_records(load_records(args.data), args.status, args.owner, args.query)
    if args.json:
        json.dump([asdict(record) for record in records], out, indent=2)
        out.write("\n")
    else:
        for record in records:
            out.write(f"{record.id:>4}  {record.status:<8}  {record.owner:<8}  {record.title}\n")
    return 0


def cmd_export(args, out):
    """Write the matching records to a CSV file and print its path."""
    records = filter_records(load_records(args.data), args.status, args.owner, args.query)
    path = args.output or default_export_path(args.export_dir)
    try:
        written = write_export(records, path, force=args.force)
    except FileExistsError:
        print(f"recordbook: {path} already exists; use --force to replace it", file=sys.stderr)
        return 1
    out.write(f"{written}\n")
    print(f"exported {len(records)} records", file=sys.stderr)
    return 0


COMMANDS = {"list": cmd_list, "export": cmd_export}


def main(argv=None, out=None):
    """Run the command line and return the exit status."""
    out = out or sys.stdout
    args = build_parser().parse_args(argv)
    try:
        return COMMANDS[args.command](args, out)
    except FileNotFoundError:
        print(f"recordbook: data file not found: {args.data}", file=sys.stderr)
        return 1
