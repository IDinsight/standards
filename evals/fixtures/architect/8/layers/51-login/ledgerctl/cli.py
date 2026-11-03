import argparse
import getpass
import json
import os
import sys

from ledgerctl import credstore
from ledgerctl.client import ApiError, LedgerClient
from ledgerctl.config import DEFAULTS, load_config, load_stored, save_config

NOT_AUTHENTICATED = "not authenticated: pass --token or set LEDGERCTL_TOKEN"


def build_parser():
    parser = argparse.ArgumentParser(prog="ledgerctl", description="Ledger reporting API client")
    parser.add_argument("--token", help="API token (overrides LEDGERCTL_TOKEN)")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("login", help="store an API token for later commands")
    commands.add_parser("whoami", help="show the account the token belongs to")
    balances = commands.add_parser("balances", help="list account balances")
    balances.add_argument("--format", choices=["table", "json"])
    config = commands.add_parser("config", help="get or set a configuration value")
    config.add_argument("key", choices=sorted(DEFAULTS))
    config.add_argument("value", nargs="?")
    return parser


def explicit_token(args):
    return args.token or os.environ.get("LEDGERCTL_TOKEN")


def resolve_token(args, settings):
    return explicit_token(args) or credstore.load_token(settings["base_url"])


def print_balances(rows, fmt, out):
    if fmt == "json":
        print(json.dumps(rows), file=out)
        return
    for row in rows:
        print(f"{row['account']:<20} {row['amount']:>12}", file=out)


def login(args, settings, client_factory, out):
    token = explicit_token(args) or getpass.getpass("API token: ")
    client = client_factory(settings["base_url"], token)
    try:
        identity = client.whoami()
    except ApiError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    credstore.save_token(settings["base_url"], token)
    print(f"Logged in as {identity['email']}", file=out)
    return 0


def main(argv=None, client_factory=LedgerClient, out=None):
    if out is None:
        out = sys.stdout
    args = build_parser().parse_args(argv)
    if args.command == "config":
        if args.value is None:
            print(load_config()[args.key], file=out)
        else:
            save_config({**load_stored(), args.key: args.value})
        return 0

    settings = load_config()
    if args.command == "login":
        return login(args, settings, client_factory, out)
    token = resolve_token(args, settings)
    if not token:
        print(NOT_AUTHENTICATED, file=sys.stderr)
        return 2
    client = client_factory(settings["base_url"], token)
    try:
        if args.command == "whoami":
            print(client.whoami()["email"], file=out)
        elif args.command == "balances":
            print_balances(client.balances(), args.format or settings["default_format"], out)
    except ApiError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0
