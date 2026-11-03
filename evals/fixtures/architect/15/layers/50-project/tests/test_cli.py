from tally.cli import main


def test_missing_ledger_exits_2(capsys, tmp_path):
    assert main(["report", str(tmp_path / "nope.csv")]) == 2
    assert "ledger file not found" in capsys.readouterr().err
