import argparse
import sys

from tally.ledger import LedgerError, load_entries
from tally.report import summarize, write_report


def main(argv=None):
    parser = argparse.ArgumentParser(prog="tally")
    sub = parser.add_subparsers(dest="command", required=True)
    report = sub.add_parser("report", help="summarize a ledger file by account")
    report.add_argument("ledger", help="path to the ledger CSV file")
    report.add_argument("--account", help="only include this account")
    args = parser.parse_args(argv)

    try:
        entries = load_entries(args.ledger)
    except LedgerError as exc:
        print(f"tally: {exc}", file=sys.stderr)
        return 2
    write_report(summarize(entries, args.account), sys.stdout)
    return 0
