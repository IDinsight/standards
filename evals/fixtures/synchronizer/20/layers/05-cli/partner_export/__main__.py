import sys

from partner_export.export import write_export
from partner_export.settings import make_source


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    if len(args) != 1:
        print("usage: python3 -m partner_export OUTPUT.csv", file=sys.stderr)
        return 2
    path = write_export(make_source().accounts(), args[0])
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
