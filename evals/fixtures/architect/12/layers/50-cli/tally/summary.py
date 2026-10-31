"""Read a CSV file and compute one statistic over a numeric column."""

import csv

STATS = ("sum", "mean", "count", "min", "max")


class DataError(Exception):
    """The input cannot be summarized as requested."""


def read_rows(handle, delimiter=","):
    reader = csv.DictReader(handle, delimiter=delimiter)
    if not reader.fieldnames:
        raise DataError("input has no header row")
    return reader


def summarize(reader, column, group_by=None, stat="sum"):
    header = reader.fieldnames
    for name in (column, group_by):
        if name is not None and name not in header:
            available = ", ".join(header)
            raise DataError(f"column {name!r} not in header (available: {available})")
    groups = {}
    for row in reader:
        raw = row.get(column)
        if raw is None or not raw.strip():
            continue
        try:
            value = float(raw)
        except ValueError:
            raise DataError(
                f"line {reader.line_num}: value {raw!r} in column {column!r} is not a number"
            ) from None
        key = (row.get(group_by) or "") if group_by else ""
        groups.setdefault(key, []).append(value)
    if not groups:
        raise DataError(f"column {column!r} has no numeric values")
    return {key: _compute(stat, values) for key, values in groups.items()}


def _compute(stat, values):
    if stat == "sum":
        return sum(values)
    if stat == "mean":
        return sum(values) / len(values)
    if stat == "count":
        return len(values)
    if stat == "min":
        return min(values)
    return max(values)
