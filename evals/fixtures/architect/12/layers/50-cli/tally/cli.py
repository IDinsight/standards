"""Command-line interface for tally."""

import argparse
import csv
import io
import json
import sys

from tally import __version__
from tally.summary import STATS, DataError, read_rows, summarize

FORMATS = ("table", "csv", "json")


def build_parser():
    parser = argparse.ArgumentParser(
        prog="tally",
        description="Summarize a numeric column of a CSV file, optionally per group.",
    )
    parser.add_argument("file", help="CSV file to read, or - to read standard input")
    parser.add_argument("-c", "--column", required=True, help="numeric column to summarize")
    parser.add_argument(
        "-g", "--group-by", metavar="COLUMN",
        help="print one result per distinct value of COLUMN",
    )
    parser.add_argument(
        "-s", "--stat", choices=STATS, default="sum",
        help="statistic to compute (default: %(default)s)",
    )
    parser.add_argument(
        "-d", "--delimiter", default=",",
        help="field delimiter (default: %(default)r); pass '\\t' for tab-separated files",
    )
    parser.add_argument(
        "-f", "--format", choices=FORMATS, default="table",
        help="output format (default: %(default)s)",
    )
    parser.add_argument(
        "-p", "--precision", type=int, default=2,
        help="decimal places for table and csv output (default: %(default)s)",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    delimiter = "\t" if args.delimiter == "\\t" else args.delimiter
    if len(delimiter) != 1:
        parser.error("--delimiter must be a single character")
    if args.precision < 0:
        parser.error("--precision must be zero or more")
    try:
        if args.file == "-":
            results = _summarize(sys.stdin, args, delimiter)
        else:
            with open(args.file, newline="", encoding="utf-8") as handle:
                results = _summarize(handle, args, delimiter)
    except FileNotFoundError:
        return _fail(f"input file not found: {args.file}")
    except IsADirectoryError:
        return _fail(f"input path is a directory: {args.file}")
    except UnicodeDecodeError:
        return _fail(f"input file is not UTF-8 text: {args.file}")
    except DataError as exc:
        return _fail(str(exc))
    sys.stdout.write(render(results, args.format, args.group_by, args.precision))
    return 0


def _summarize(handle, args, delimiter):
    reader = read_rows(handle, delimiter)
    return summarize(reader, args.column, group_by=args.group_by, stat=args.stat)


def _fail(message):
    print(f"tally: error: {message}", file=sys.stderr)
    return 1


def _format(value, precision):
    if isinstance(value, int):
        return str(value)
    return f"{value:.{precision}f}"


def render(results, fmt, group_by, precision):
    keys = sorted(results)
    if fmt == "json":
        if group_by:
            return json.dumps({key: results[key] for key in keys}, indent=2) + "\n"
        return json.dumps(results[""]) + "\n"
    rows = [(key, _format(results[key], precision)) for key in keys]
    if fmt == "csv":
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow([group_by, "value"] if group_by else ["value"])
        for key, text in rows:
            writer.writerow([key, text] if group_by else [text])
        return out.getvalue()
    if not group_by:
        return rows[0][1] + "\n"
    width = max(len(group_by), *(len(key) for key, _ in rows))
    lines = [f"{group_by:<{width}}  value"]
    lines += [f"{key:<{width}}  {text}" for key, text in rows]
    return "\n".join(lines) + "\n"
