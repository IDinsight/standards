import argparse

from timer.durations import parse_duration


def build_parser():
    parser = argparse.ArgumentParser(prog="timer")
    parser.add_argument("command")
    parser.add_argument("--every", default="15m", help="interval between runs, e.g. 30s, 5m, 2h")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    interval = parse_duration(args.every)
    print(f"running {args.command!r} every {interval} seconds")
    return 0
