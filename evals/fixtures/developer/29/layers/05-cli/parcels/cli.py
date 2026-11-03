import csv
import sys

from parcels.models import Parcel
from parcels.summary import summarize


def read_parcels(path: str) -> list[Parcel]:
    with open(path, newline="") as handle:
        return [
            Parcel(row["parcel_id"], row["destination"], int(row["weight_grams"]))
            for row in csv.DictReader(handle)
        ]


def format_summary(summary: dict[str, dict]) -> str:
    lines = ["destination  zone  parcels  weight_kg"]
    for code, row in summary.items():
        lines.append(
            f"{code:<11}  {row['zone']:<4}  {row['parcels']:>7}  {row['weight_grams'] / 1000:>9.3f}"
        )
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 1:
        print("usage: python3 -m parcels.cli PARCELS.csv", file=sys.stderr)
        return 2
    print(format_summary(summarize(read_parcels(argv[0]))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
