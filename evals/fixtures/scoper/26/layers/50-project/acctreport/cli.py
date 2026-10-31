import argparse
import sys

from acctreport.report import load_ledger, summarize, to_csv, to_json


def main(argv=None):
    parser = argparse.ArgumentParser(prog="acctreport")
    commands = parser.add_subparsers(dest="command", required=True)
    export = commands.add_parser("export", help="total a ledger file by account")
    export.add_argument("ledger", help="path to a ledger CSV file")
    export.add_argument("--format", choices=["csv", "json"], default="csv")
    args = parser.parse_args(argv)

    with open(args.ledger, newline="", encoding="utf-8") as handle:
        rows = summarize(load_ledger(handle))
    output = to_json(rows) if args.format == "json" else to_csv(rows)
    sys.stdout.write(output)
    return 0
