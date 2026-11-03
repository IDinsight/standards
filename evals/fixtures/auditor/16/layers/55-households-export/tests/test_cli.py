from pathlib import Path

from app.cli import main

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "sample_registry.json"


def test_export_households_writes_file(tmp_path):
    out = tmp_path / "households.csv"
    assert main(["export-households", "--data", str(SAMPLE), "--out", str(out)]) == 0
    lines = out.read_text(encoding="utf-8").splitlines()
    assert lines[0] == "household_id,head_name,district,size,registered_on"
    assert len(lines) == 3
