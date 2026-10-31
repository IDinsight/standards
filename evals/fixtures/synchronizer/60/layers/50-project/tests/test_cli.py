from csvsum.cli import main


def test_prints_summary(tmp_path, capsys):
    path = tmp_path / "items.csv"
    path.write_text("amount\n2\n4\n", encoding="utf-8")
    assert main([str(path)]) == 0
    assert capsys.readouterr().out == "amount: count=2 min=2 max=4 mean=3.00\n"


def test_missing_file(tmp_path, capsys):
    assert main([str(tmp_path / "missing.csv")]) == 2
    assert "no such file" in capsys.readouterr().err


def test_unknown_column(tmp_path, capsys):
    path = tmp_path / "items.csv"
    path.write_text("amount\n2\n", encoding="utf-8")
    assert main([str(path), "--column", "price"]) == 2
    assert "unknown column: price" in capsys.readouterr().err
