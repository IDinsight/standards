from reportkit.config import load_config
from reportkit.export import export_rows, format_rows


def test_csv_quotes_commas():
    assert format_rows([{"id": 1, "name": "a,b"}], "csv") == 'id,name\n1,"a,b"\n'


def test_csv_empty():
    assert format_rows([], "csv") == ""


def test_jsonl_sorted_keys():
    assert format_rows([{"b": 2, "a": 1}], "jsonl") == '{"a": 1, "b": 2}\n'


def test_export_writes_file(tmp_path):
    config = load_config({"output_dir": str(tmp_path / "out"), "output_format": "jsonl"})
    path = export_rows([{"id": 1}], config, "daily")
    assert path.endswith("daily.jsonl")
    with open(path, encoding="utf-8") as handle:
        assert handle.read() == '{"id": 1}\n'
