import argparse

from inventory.report import build_summary, format_text
from inventory.store import load_items


def build_parser():
    parser = argparse.ArgumentParser(prog="inventory")
    commands = parser.add_subparsers(dest="command", required=True)
    summary = commands.add_parser("summary", help="print a stock summary")
    summary.add_argument("path", help="CSV file with sku,name,quantity,reorder_level")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    if args.command == "summary":
        print(format_text(build_summary(load_items(args.path))))
    return 0
