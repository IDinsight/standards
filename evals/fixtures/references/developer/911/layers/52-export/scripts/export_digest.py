"""Export a weekly digest from a JSON list of items.

Usage: python -m scripts.export_digest ITEMS.json --team NAME [--day YYYY-MM-DD] [--out-dir DIR]
"""

import argparse
import json
from datetime import date
from pathlib import Path

from app.reports.digest import build_digest
from app.utils.text import slugify


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export a weekly team digest.")
    parser.add_argument("items", help="JSON file with a list of {title, summary} objects")
    parser.add_argument("--team", required=True)
    parser.add_argument("--day", type=date.fromisoformat, default=date.today())
    parser.add_argument("--out-dir", type=Path)
    args = parser.parse_args(argv)

    items = json.loads(Path(args.items).read_text(encoding="utf-8"))
    text = build_digest(args.team, items, args.day)
    if args.out_dir is None:
        print(text, end="")
        return 0
    args.out_dir.mkdir(parents=True, exist_ok=True)
    target = args.out_dir / f"{slugify(args.team)}-{args.day.isoformat()}.md"
    target.write_text(text, encoding="utf-8")
    print(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
