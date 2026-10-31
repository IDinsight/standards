import argparse
import sys

from tally.counter import count_words, top


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="tally", description="Count word frequencies.")
    parser.add_argument("path", help="text file to read, or - for stdin")
    parser.add_argument("-n", type=int, default=10, help="number of words to show")
    args = parser.parse_args(argv)
    if args.path == "-":
        text = sys.stdin.read()
    else:
        with open(args.path, encoding="utf-8") as handle:
            text = handle.read()
    for word, count in top(count_words(text), args.n):
        print(f"{count:>6} {word}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
