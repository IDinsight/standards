import argparse
import sys

from inventory.stock import load_items, total_units


def main(argv=None):
    parser = argparse.ArgumentParser(prog="inventory")
    commands = parser.add_subparsers(dest="command", required=True)
    summary = commands.add_parser("summary", help="print item and unit counts")
    summary.add_argument("csv_path")
    args = parser.parse_args(argv)
    if args.command == "summary":
        items = load_items(args.csv_path)
        print(f"{len(items)} items, {total_units(items)} units")
    return 0


if __name__ == "__main__":
    sys.exit(main())
