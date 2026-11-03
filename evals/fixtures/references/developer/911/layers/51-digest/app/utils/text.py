"""Small text helpers used by the digest code."""

import re
import unicodedata

_NON_WORD = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    """Return a lowercase ASCII slug with words joined by hyphens."""
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return _NON_WORD.sub("-", normalized.lower()).strip("-")


def truncate_words(text: str, limit: int, suffix: str = "…") -> str:
    """Keep at most ``limit`` words, appending ``suffix`` when words were dropped."""
    words = text.split()
    if len(words) <= limit:
        return " ".join(words)
    return " ".join(words[:limit]) + suffix
