import argparse
import sys

from durfmt.parse import DurationError, parse
from durfmt.render import format_duration


def main(argv=None):
    parser = argparse.ArgumentParser(prog="durfmt", description="Convert between durations and seconds.")
    parser.add_argument("value", help='a duration such as "1h30m", or a number of seconds')
    parser.add_argument("--largest", choices=list("dhms"), default="d",
                        help="biggest unit to use when formatting seconds")
    args = parser.parse_args(argv)
    try:
        if args.value.isdigit():
            print(format_duration(int(args.value), largest=args.largest))
        else:
            print(parse(args.value))
    except DurationError as exc:
        print(f"durfmt: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
