"""Render the weekly team digest from plain item data."""

from datetime import date

from app.utils.dates import week_range
from app.utils.text import slugify, truncate_words

SUMMARY_WORDS = 20


def build_digest(team: str, items: list[dict], day: date) -> str:
    """Return the Markdown digest for the week containing ``day``."""
    start, end = week_range(day)
    lines = [f"# {team} digest, {start.isoformat()} to {end.isoformat()}", ""]
    if not items:
        lines.append("No updates this week.")
    for item in items:
        title = item["title"]
        lines.append(f'<a id="{slugify(title)}"></a>')
        lines.append(f"## {title}")
        lines.append(truncate_words(item.get("summary", ""), SUMMARY_WORDS))
        lines.append("")
    return "\n".join(lines).rstrip("\n") + "\n"
