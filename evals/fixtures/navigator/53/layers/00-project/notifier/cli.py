import argparse
import sys

from notifier.config import load_config
from notifier.sender import DeliveryError, send_with_retry


def main(argv=None):
    parser = argparse.ArgumentParser(prog="notifier")
    parser.add_argument("message")
    parser.add_argument("--config", help="path to a JSON config file")
    args = parser.parse_args(argv)
    config = load_config(args.config)
    try:
        attempts = send_with_retry(config, {"text": args.message})
    except DeliveryError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(f"sent after {attempts} attempt(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
