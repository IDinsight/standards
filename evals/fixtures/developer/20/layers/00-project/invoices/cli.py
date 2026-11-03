import argparse
import sys

from invoices.store import load


def format_row(invoice):
    total = invoice.total_cents / 100
    return f"{invoice.number}\t{invoice.issued.isoformat()}\t{invoice.customer}\t{total:.2f}"


def build_parser():
    parser = argparse.ArgumentParser(prog="invoices")
    sub = parser.add_subparsers(dest="command", required=True)
    listing = sub.add_parser("list", help="list invoices in a data file")
    listing.add_argument("path")
    return parser


def main(argv=None, out=sys.stdout):
    args = build_parser().parse_args(argv)
    if args.command == "list":
        for invoice in sorted(load(args.path), key=lambda item: item.issued):
            print(format_row(invoice), file=out)
    return 0
