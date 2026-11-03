"""Command-line entry point for batch imports."""
import argparse
import sys

from importer import import_batch


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        prog="ledgerload",
        description="Import batches of transaction CSV files into a SQLite ledger.",
    )
    parser.add_argument("files", nargs="+", help="CSV files to import, in order")
    parser.add_argument("--db", default="ledger.db", help="SQLite database file (created if missing)")
    parser.add_argument("--batch-size", type=int, default=500, help="rows written per transaction")
    parser.add_argument("--dry-run", action="store_true", help="validate rows without writing")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    result = import_batch(args.files, db_path=args.db, batch_size=args.batch_size, dry_run=args.dry_run)
    print(f"imported {result.imported} rows, rejected {result.rejected}")
    for error in result.errors:
        print(f"  {error}", file=sys.stderr)
    return 1 if result.rejected else 0


if __name__ == "__main__":
    sys.exit(main())
