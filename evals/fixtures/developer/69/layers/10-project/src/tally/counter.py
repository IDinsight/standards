import re
from collections import Counter

WORD = re.compile(r"[a-z0-9']+")


def count_words(text: str) -> Counter[str]:
    return Counter(WORD.findall(text.lower()))


def top(counts: Counter[str], n: int = 10) -> list[tuple[str, int]]:
    return sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:n]
