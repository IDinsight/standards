from dataclasses import dataclass

DEFAULT_RETENTION_DAYS = 14
DEFAULT_FORMAT = "csv"
DEFAULT_OUTPUT_DIR = "exports"
FORMATS = ("csv", "jsonl")


@dataclass(frozen=True)
class Config:
    retention_days: int
    output_format: str
    output_dir: str


def load_config(values):
    """Build a Config from a settings dictionary, filling in defaults."""
    retention = int(values.get("retention_days", DEFAULT_RETENTION_DAYS))
    if retention < 1:
        raise ValueError("retention_days must be at least 1")
    output_format = values.get("output_format", DEFAULT_FORMAT)
    if output_format not in FORMATS:
        raise ValueError(f"unsupported output_format: {output_format}")
    return Config(retention, output_format, values.get("output_dir", DEFAULT_OUTPUT_DIR))
