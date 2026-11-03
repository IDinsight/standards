import argparse
import sys

from tally.ledger import LedgerError, blank_categories, load_rows, totals


def build_parser():
    parser = argparse.ArgumentParser(prog="tally", description="Summarize expense CSV files.")
    commands = parser.add_subparsers(dest="command", required=True)
    summary = commands.add_parser("summary", help="print totals")
    summary.add_argument("path")
    summary.add_argument("--by", choices=("category", "month"), default="category")
    check = commands.add_parser("check", help="confirm a file can be read")
    check.add_argument("path")
    check.add_argument("--strict", action="store_true", help="also reject rows with a blank category")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        rows = load_rows(args.path)
    except (OSError, LedgerError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    if args.command == "summary":
        for key, amount in totals(rows, by=args.by).items():
            print(f"{key}\t{amount}")
        return 0
    if args.strict:
        blanks = blank_categories(rows)
        if blanks:
            print(f"error: blank category on line(s) {', '.join(map(str, blanks))}", file=sys.stderr)
            return 1
    print(f"ok: {len(rows)} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
