import argparse
import json
from datetime import date

from tally.entries import read_entries
from tally.summary import weekly_summary


def main(argv=None):
    parser = argparse.ArgumentParser(prog="tally")
    parser.add_argument("csv_path")
    parser.add_argument("--week", type=date.fromisoformat, default=date.today())
    args = parser.parse_args(argv)
    summary = weekly_summary(read_entries(args.csv_path), args.week)
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
