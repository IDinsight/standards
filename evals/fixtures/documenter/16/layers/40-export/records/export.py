"""CSV rows for record exports."""

DEFAULT_COLUMNS = ("id", "title", "owner", "status", "created_at")


def csv_rows(records, columns=DEFAULT_COLUMNS):
    if not columns:
        raise ValueError("no columns selected")
    for column in columns:
        if column not in DEFAULT_COLUMNS:
            raise ValueError(f"unknown column: {column}")
    rows = [list(columns)]
    rows.extend([getattr(record, column) for column in columns] for record in records)
    return rows
