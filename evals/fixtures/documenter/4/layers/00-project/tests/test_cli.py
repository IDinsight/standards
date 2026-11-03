import json
from pathlib import Path

from recordbook.cli import main

DATA = Path(__file__).resolve().parent.parent / "data" / "records.json"


def test_list_prints_every_record(capsys):
    assert main(["--data", str(DATA), "list"]) == 0
    lines = capsys.readouterr().out.splitlines()
    assert [int(line.split()[0]) for line in lines] == [1, 2, 3, 4, 5, 6]


def test_list_json_applies_filters(capsys):
    assert main(["--data", str(DATA), "list", "--status", "active", "--owner", "marco", "--json"]) == 0
    assert [record["id"] for record in json.loads(capsys.readouterr().out)] == [4, 6]


def test_missing_data_file(tmp_path, capsys):
    assert main(["--data", str(tmp_path / "none.json"), "list"]) == 1
    assert "data file not found" in capsys.readouterr().err
