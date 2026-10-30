from datetime import datetime, timezone
from pathlib import Path

import pytest

from recordbook.cli import main
from recordbook.export import default_export_path, to_csv, write_export
from recordbook.store import Record

DATA = Path(__file__).resolve().parent.parent / "data" / "records.json"
HEADER = "id,title,owner,status,created_at\r\n"


def test_plain_fields_are_not_quoted():
    records = [Record(4, "Insurance renewal 2026", "marco", "active", "2026-04-18T16:20:00Z")]
    assert to_csv(records) == HEADER + "4,Insurance renewal 2026,marco,active,2026-04-18T16:20:00Z\r\n"


def test_commas_quotes_and_line_breaks_are_quoted():
    records = [
        Record(1, "Lease agreement, Building B", "dana", "active", "2026-03-02T10:15:00Z"),
        Record(3, 'Q2 "priority" accounts review', "dana", "archived", "2026-04-01T08:05:00Z"),
        Record(7, "first line\nsecond line", "li", "active", "2026-05-01T12:00:00Z"),
    ]
    rows = to_csv(records).split("\r\n")
    assert rows[1] == '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z'
    assert rows[2] == '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z'
    assert rows[3] == '7,"first line\nsecond line",li,active,2026-05-01T12:00:00Z'


def test_default_path_uses_utc_timestamp(tmp_path):
    now = datetime(2026, 9, 24, 9, 0, 0, tzinfo=timezone.utc)
    assert default_export_path(tmp_path, now) == tmp_path / "records-20260924T090000Z.csv"


def test_write_export_refuses_to_overwrite(tmp_path):
    target = tmp_path / "out.csv"
    target.write_text("old", encoding="utf-8")
    with pytest.raises(FileExistsError):
        write_export([], target)
    assert target.read_text(encoding="utf-8") == "old"
    write_export([], target, force=True)
    assert target.read_bytes() == HEADER.encode()


def test_export_command_writes_filtered_records(tmp_path, capsys):
    output = tmp_path / "dana.csv"
    assert main(["--data", str(DATA), "export", "--owner", "dana", "--output", str(output)]) == 0
    assert output.read_bytes() == (
        HEADER
        + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
        + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n'
    ).encode()
    captured = capsys.readouterr()
    assert captured.out == f"{output}\n"
    assert "exported 2 records" in captured.err


def test_export_command_defaults_to_timestamped_file(tmp_path, capsys):
    export_dir = tmp_path / "exports"
    assert main(["--data", str(DATA), "export", "--export-dir", str(export_dir)]) == 0
    files = list(export_dir.iterdir())
    assert len(files) == 1
    assert files[0].name.startswith("records-") and files[0].suffix == ".csv"
    rows = files[0].read_bytes().decode().split("\r\n")
    assert [row.split(",")[0] for row in rows[1:-1]] == ["1", "2", "3", "4", "5", "6"]
    assert capsys.readouterr().out == f"{files[0]}\n"


def test_export_command_refuses_existing_file(tmp_path, capsys):
    output = tmp_path / "out.csv"
    output.write_text("keep", encoding="utf-8")
    assert main(["--data", str(DATA), "export", "--output", str(output)]) == 1
    assert output.read_text(encoding="utf-8") == "keep"
    assert "already exists" in capsys.readouterr().err


def test_export_command_rejects_unknown_status(tmp_path):
    output = tmp_path / "out.csv"
    with pytest.raises(SystemExit) as exit_info:
        main(["--data", str(DATA), "export", "--status", "deleted", "--output", str(output)])
    assert exit_info.value.code == 2
    assert not output.exists()
