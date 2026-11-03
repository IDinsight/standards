from partner_export import __main__ as cli
from partner_export.settings import FEED_PATH, make_source
from partner_export.sources import JsonlFeedSource

EXPECTED = (
    "account_id,name,country,updated_on\r\n"
    "101,Acme Freight GmbH,DE,2026-09-03\r\n"
    '103,"Café Sol, Lda",PT,2026-09-10\r\n'
    "104,Lindqvist Bygg AB,SE,2026-09-12\r\n"
)


def test_usage_without_output_path(capsys):
    assert cli.main([]) == 2
    assert "usage" in capsys.readouterr().err


def test_default_source_is_the_accounts_feed():
    source = make_source()
    assert isinstance(source, JsonlFeedSource)
    assert source.path == FEED_PATH


def test_export_from_the_feed(tmp_path):
    out = tmp_path / "partners.csv"
    assert cli.main([str(out)]) == 0
    assert out.read_bytes().decode("utf-8") == EXPECTED


def test_bad_feed_line_fails_without_output(tmp_path, monkeypatch, capsys):
    feed = tmp_path / "accounts.jsonl"
    feed.write_text(
        '{"id": 1, "name": "Acme", "country": "DE", "status": "active", "updated_at": "2026-09-03T16:05:00Z"}\n'
        "not json\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(cli, "make_source", lambda: JsonlFeedSource(feed))
    out = tmp_path / "partners.csv"
    assert cli.main([str(out)]) == 1
    assert capsys.readouterr().err.startswith(f"error: {feed}:2: invalid JSON")
    assert not out.exists()


def test_missing_feed_fails_without_output(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(cli, "make_source", lambda: JsonlFeedSource(tmp_path / "absent.jsonl"))
    out = tmp_path / "partners.csv"
    assert cli.main([str(out)]) == 1
    assert "absent.jsonl" in capsys.readouterr().err
    assert not out.exists()
