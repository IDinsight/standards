import argparse
import sys

from csvsum.summary import summarize


def build_parser():
    parser = argparse.ArgumentParser(prog="csvsum", description="Summarize the numeric columns of a CSV file.")
    parser.add_argument("path", help="CSV file with a header row")
    parser.add_argument("--column", action="append", dest="columns", metavar="NAME", help="column to summarize; repeat for more")
    parser.add_argument("--delimiter", default=",", metavar="CHAR", help="field separator (default: comma)")
    return parser


def format_line(name, stats):
    if stats["count"] == 0:
        return f"{name}: no numeric values"
    return f"{name}: count={stats['count']} min={stats['min']:g} max={stats['max']:g} mean={stats['mean']:.2f}"


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        with open(args.path, newline="", encoding="utf-8") as handle:
            results = summarize(handle, columns=args.columns, delimiter=args.delimiter)
    except FileNotFoundError:
        print(f"csvsum: no such file: {args.path}", file=sys.stderr)
        return 2
    except KeyError as exc:
        print(f"csvsum: unknown column: {exc.args[0]}", file=sys.stderr)
        return 2
    for name, stats in results.items():
        print(format_line(name, stats))
    return 0
