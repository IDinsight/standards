"""Command line entry point.

    python -m app.cli export [--status S] [--owner O] [--q TEXT] > records.csv
"""
import argparse
import sys

from app.db import connect
from app.export import export_csv
from app.filters import parse_filter


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="records")
    commands = parser.add_subparsers(dest="command", required=True)
    export = commands.add_parser("export", help="write the matching records to standard output as CSV")
    for name in ("status", "owner", "q"):
        export.add_argument(f"--{name}", default="")
    args = parser.parse_args(argv)
    try:
        record_filter = parse_filter({"status": args.status, "owner": args.owner, "q": args.q})
    except ValueError as error:
        parser.error(str(error))
    with connect() as conn:
        export_csv(conn, record_filter, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
