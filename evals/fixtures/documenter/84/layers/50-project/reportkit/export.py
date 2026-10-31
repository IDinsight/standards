import csv
import io
import json
import os


def format_rows(rows, output_format):
    """Return the export text for a list of dictionaries."""
    if output_format == "jsonl":
        return "".join(json.dumps(row, sort_keys=True) + "\n" for row in rows)
    if output_format != "csv":
        raise ValueError(f"unsupported output_format: {output_format}")
    if not rows:
        return ""
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0]), lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def export_rows(rows, config, name):
    """Write rows to <output_dir>/<name>.<output_format> and return the path."""
    os.makedirs(config.output_dir, exist_ok=True)
    path = os.path.join(config.output_dir, f"{name}.{config.output_format}")
    with open(path, "w", encoding="utf-8", newline="") as handle:
        handle.write(format_rows(rows, config.output_format))
    return path
