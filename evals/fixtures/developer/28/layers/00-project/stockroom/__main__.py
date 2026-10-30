import argparse
import sys

from stockroom.inventory import Inventory


def main(argv=None):
    parser = argparse.ArgumentParser(prog="stockroom")
    parser.add_argument("--data", default="stock.json")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list")
    adjust = sub.add_parser("adjust")
    adjust.add_argument("sku")
    adjust.add_argument("delta", type=int)
    args = parser.parse_args(argv)

    inventory = Inventory.load(args.data)
    if args.command == "list":
        for item in inventory.all():
            print(f"{item.sku}\t{item.name}\t{item.on_hand}")
    elif args.command == "adjust":
        item = inventory.adjust(args.sku, args.delta)
        inventory.save(args.data)
        print(f"{item.sku}\t{item.on_hand}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
