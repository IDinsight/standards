from pathlib import Path

from partner_export.sources import TsvDumpSource

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DUMP_PATH = PROJECT_ROOT / "data" / "legacy" / "accounts.tsv"


def make_source():
    """The account source the export reads."""
    return TsvDumpSource(DUMP_PATH)
