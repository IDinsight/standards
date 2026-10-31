import argparse
import sys

from app.households.export import export_households
from app.registry import load_registry


def main(argv=None):
    parser = argparse.ArgumentParser(prog="registry")
    sub = parser.add_subparsers(dest="command", required=True)
    households = sub.add_parser("export-households", help="Write active households as CSV")
    households.add_argument("--data", required=True, help="Registry JSON file")
    households.add_argument("--out", help="Output file (default: stdout)")
    args = parser.parse_args(argv)

    registry = load_registry(args.data)
    if args.out:
        with open(args.out, "w", newline="", encoding="utf-8") as fh:
            count = export_households(registry.households.all(), fh)
    else:
        count = export_households(registry.households.all(), sys.stdout)
    print(f"exported {count} households", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
