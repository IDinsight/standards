import sqlite3

from importer import import_batch

HEADER = "id,date,account,amount,memo\n"


def write_csv(path, body):
    path.write_text(HEADER + body, encoding="utf-8")
    return str(path)


def test_imports_valid_rows(tmp_path):
    source = write_csv(tmp_path / "a.csv", "t1,2026-01-02,cash,12.50,coffee\nt2,2026-01-03,bank,-40,rent share\n")
    db = tmp_path / "ledger.db"
    result = import_batch([source], db_path=str(db))
    assert (result.imported, result.rejected) == (2, 0)
    rows = sqlite3.connect(db).execute("SELECT id, amount FROM transactions ORDER BY id").fetchall()
    assert rows == [("t1", "12.50"), ("t2", "-40")]


def test_rejected_rows_name_file_and_line(tmp_path):
    source = write_csv(tmp_path / "a.csv", "t1,2026-01-02,cash,5,\nt2,2026-13-01,cash,5,\n")
    result = import_batch([source], db_path=str(tmp_path / "ledger.db"))
    assert (result.imported, result.rejected) == (1, 1)
    assert result.errors[0].endswith("a.csv:3: bad date '2026-13-01'")


def test_batches_span_files(tmp_path):
    first = write_csv(tmp_path / "a.csv", "t1,2026-01-02,cash,1,\nt2,2026-01-02,cash,2,\n")
    second = write_csv(tmp_path / "b.csv", "t3,2026-01-03,cash,3,\n")
    result = import_batch([first, second], db_path=str(tmp_path / "ledger.db"), batch_size=2)
    assert result.imported == 3


def test_dry_run_writes_nothing(tmp_path):
    source = write_csv(tmp_path / "a.csv", "t1,2026-01-02,cash,1,\n")
    db = tmp_path / "ledger.db"
    result = import_batch([source], db_path=str(db), dry_run=True)
    assert result.imported == 1
    assert not db.exists()
