import io
from datetime import date
from pathlib import Path

from invoices.cli import main
from invoices.store import load

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "sample.json"


def test_load_parses_dates_and_totals():
    invoices = load(SAMPLE)
    assert len(invoices) == 4
    assert invoices[0].number == "INV-1001"
    assert invoices[0].issued == date(2026, 1, 14)
    assert invoices[0].total_cents == 125000


def test_list_sorts_by_issue_date():
    out = io.StringIO()
    assert main(["list", str(SAMPLE)], out=out) == 0
    lines = out.getvalue().splitlines()
    assert [line.split("\t")[0] for line in lines] == ["INV-1001", "INV-1002", "INV-1003", "INV-1004"]
    assert lines[0] == "INV-1001\t2026-01-14\tHalden Supply\t1250.00"
