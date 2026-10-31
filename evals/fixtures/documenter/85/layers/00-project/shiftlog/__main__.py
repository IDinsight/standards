import sys

from shiftlog.parse import ShiftError, parse_lines
from shiftlog.report import format_week

USAGE = "usage: python3 -m shiftlog week FILE"


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    if len(args) != 2 or args[0] != "week":
        print(USAGE, file=sys.stderr)
        return 2
    try:
        with open(args[1], encoding="utf-8") as handle:
            shifts = parse_lines(handle)
    except OSError as exc:
        print(f"shiftlog: {exc.strerror}: {args[1]}", file=sys.stderr)
        return 1
    except ShiftError as exc:
        print(f"shiftlog: {exc}", file=sys.stderr)
        return 1
    print(format_week(shifts))
    return 0


if __name__ == "__main__":
    sys.exit(main())
