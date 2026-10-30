import csv
from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Entry:
    day: date
    project: str
    minutes: int


def read_entries(path):
    with open(path, newline="", encoding="utf-8") as handle:
        return [parse_row(row) for row in csv.DictReader(handle)]


def parse_row(row):
    minutes = int(row["minutes"])
    if minutes < 0:
        raise ValueError(f"negative duration on {row['date']}")
    return Entry(date.fromisoformat(row["date"]), row["project"].strip(), minutes)
