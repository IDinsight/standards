import json
import sys

from src.query import run_query


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    request = json.loads(argv[0]) if argv else {}
    for row in run_query(request):
        print(json.dumps(row))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
