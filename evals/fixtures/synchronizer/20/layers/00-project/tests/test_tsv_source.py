from datetime import date

from partner_export.sources import TsvDumpSource


def write_dump(tmp_path, lines):
    path = tmp_path / "accounts.tsv"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def test_reads_accounts_and_normalizes_fields(tmp_path):
    path = write_dump(tmp_path, [
        "account_id\tname\tcountry\tstatus\tupdated",
        "7\t Nordlicht GmbH \tde\tActive\t03/09/2026",
    ])
    [account] = TsvDumpSource(path).accounts()
    assert account.account_id == 7
    assert account.name == "Nordlicht GmbH"
    assert account.country == "DE"
    assert account.status == "active"
    assert account.updated_on == date(2026, 9, 3)
