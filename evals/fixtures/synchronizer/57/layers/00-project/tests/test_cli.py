from tally.__main__ import main


def test_summary_by_category(capsys):
    assert main(["summary", "data/expenses.csv"]) == 0
    assert capsys.readouterr().out.splitlines() == [
        "dining\t27.60",
        "groceries\t154.05",
        "transport\t24.00",
        "utilities\t194.55",
    ]


def test_check_reports_row_count(capsys):
    assert main(["check", "data/expenses.csv"]) == 0
    assert capsys.readouterr().out == "ok: 8 rows\n"


def test_unreadable_file_exits_2(capsys, tmp_path):
    assert main(["check", str(tmp_path / "missing.csv")]) == 2
    assert capsys.readouterr().err.startswith("error:")


def test_strict_check_rejects_blank_category(capsys, tmp_path):
    path = tmp_path / "ledger.csv"
    path.write_text("date,category,amount\n2026-08-01,,4\n", encoding="utf-8")
    assert main(["check", "--strict", str(path)]) == 1
    assert "line(s) 2" in capsys.readouterr().err
