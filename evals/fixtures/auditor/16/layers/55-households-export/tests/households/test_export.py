import csv
import io
from datetime import date

from app.households.export import COLUMNS, export_households
from app.households.models import Household


def make(household_id, archived=False):
    return Household(household_id, "Amina Yusuf", "North", 4, date(2026, 3, 1), archived)


def test_header_and_rows_in_id_order():
    out = io.StringIO()
    count = export_households([make("H-002"), make("H-001")], out)
    rows = list(csv.reader(io.StringIO(out.getvalue())))
    assert count == 2
    assert rows[0] == COLUMNS
    assert [row[0] for row in rows[1:]] == ["H-001", "H-002"]
    assert rows[1][4] == "2026-03-01"


def test_archived_households_are_skipped():
    out = io.StringIO()
    count = export_households([make("H-001"), make("H-002", archived=True)], out)
    assert count == 1
    assert "H-002" not in out.getvalue()


def test_fields_with_commas_are_quoted():
    household = Household("H-004", "Okafor, Grace", "East", 3, date(2026, 3, 4))
    out = io.StringIO()
    export_households([household], out)
    assert '"Okafor, Grace"' in out.getvalue()


def test_rows_end_with_crlf():
    out = io.StringIO()
    export_households([make("H-001")], out)
    assert out.getvalue().splitlines(keepends=True)[1].endswith("\r\n")
