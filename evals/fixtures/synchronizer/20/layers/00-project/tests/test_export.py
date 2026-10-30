import csv
from datetime import date

from partner_export.export import HEADER, export_rows, write_export
from partner_export.model import Account

ACCOUNTS = [
    Account(3, "Harbor Supplies", "NL", "active", date(2026, 9, 1)),
    Account(1, "Café Sol, Lda", "PT", "active", date(2026, 9, 10)),
    Account(2, "Baltic Timber Ltd", "LV", "closed", date(2026, 8, 28)),
]


def test_only_active_accounts_in_id_order():
    assert [row[0] for row in export_rows(ACCOUNTS)] == [1, 3]


def test_written_file_has_header_and_quoted_fields(tmp_path):
    out = write_export(ACCOUNTS, tmp_path / "partners.csv")
    with out.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.reader(handle))
    assert rows[0] == list(HEADER)
    assert rows[1] == ["1", "Café Sol, Lda", "PT", "2026-09-10"]
    assert out.read_text(encoding="utf-8").splitlines()[1] == '1,"Café Sol, Lda",PT,2026-09-10'
