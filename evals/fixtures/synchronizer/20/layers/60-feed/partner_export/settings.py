from pathlib import Path

from partner_export.sources import JsonlFeedSource

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FEED_PATH = PROJECT_ROOT / "data" / "feed" / "accounts.jsonl"


def make_source():
    """The account source the export reads."""
    return JsonlFeedSource(FEED_PATH)
