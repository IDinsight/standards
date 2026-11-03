import json
from pathlib import Path

import pytest

from tally.cli import main

SAMPLE = str(Path(__file__).resolve().parent.parent / "examples" / "sales.csv")


def run(capsys, *args):
    code = main([SAMPLE, *args])
    captured = capsys.readouterr()
    return code, captured.out, captured.err


def test_default_sum_skips_blank_cells(capsys):
    assert run(capsys, "--column", "amount") == (0, "500.00\n", "")


def test_group_by_table(capsys):
    code, out, _ = run(capsys, "-c", "amount", "-g", "region")
    assert code == 0
    assert out == "region  value\nnorth   320.00\nsouth   180.00\n"


def test_mean_json(capsys):
    code, out, _ = run(capsys, "-c", "amount", "-g", "region", "-s", "mean", "-f", "json")
    assert code == 0
    assert json.loads(out) == {"north": 160.0, "south": 90.0}


def test_count_csv(capsys):
    code, out, _ = run(capsys, "-c", "amount", "-g", "product", "-s", "count", "-f", "csv")
    assert code == 0
    assert out == "product,value\ngadget,2\nwidget,2\n"


def test_precision_zero(capsys):
    assert run(capsys, "-c", "amount", "--precision", "0") == (0, "500\n", "")


def test_unknown_column(capsys):
    code, out, err = run(capsys, "-c", "price")
    assert code == 1
    assert out == ""
    assert err == "tally: error: column 'price' not in header (available: region, product, amount)\n"


def test_missing_file(capsys, tmp_path):
    missing = tmp_path / "nope.csv"
    assert main([str(missing), "-c", "amount"]) == 1
    assert capsys.readouterr().err == f"tally: error: input file not found: {missing}\n"


def test_non_numeric_value(capsys, tmp_path):
    data = tmp_path / "bad.csv"
    data.write_text("a\n1\nx\n")
    assert main([str(data), "-c", "a"]) == 1
    assert capsys.readouterr().err == "tally: error: line 3: value 'x' in column 'a' is not a number\n"


def test_unknown_stat_is_usage_error(capsys):
    with pytest.raises(SystemExit) as exc:
        main([SAMPLE, "-c", "amount", "-s", "median"])
    assert exc.value.code == 2
    assert "invalid choice: 'median'" in capsys.readouterr().err
