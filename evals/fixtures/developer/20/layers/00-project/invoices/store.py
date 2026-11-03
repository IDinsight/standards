import json
from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Invoice:
    number: str
    customer: str
    issued: date
    total_cents: int


def load(path):
    with open(path, encoding="utf-8") as handle:
        raw = json.load(handle)
    return [
        Invoice(
            item["number"],
            item["customer"],
            date.fromisoformat(item["issued"]),
            int(item["total_cents"]),
        )
        for item in raw
    ]
