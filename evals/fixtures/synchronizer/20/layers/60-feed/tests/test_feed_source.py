import json
from datetime import date

import pytest

from partner_export.sources import FeedError, JsonlFeedSource


def write_feed(tmp_path, lines):
    path = tmp_path / "accounts.jsonl"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def entry(**changes):
    item = {
        "id": 7,
        "name": " Nordlicht GmbH ",
        "country": "de",
        "status": "Active",
        "updated_at": "2026-09-03T08:15:00Z",
    }
    item.update(changes)
    return json.dumps(item)


def test_reads_accounts_and_normalizes_fields(tmp_path):
    [account] = JsonlFeedSource(write_feed(tmp_path, [entry()])).accounts()
    assert account.account_id == 7
    assert account.name == "Nordlicht GmbH"
    assert account.country == "DE"
    assert account.status == "active"
    assert account.updated_on == date(2026, 9, 3)


def test_updated_on_is_the_utc_day(tmp_path):
    path = write_feed(tmp_path, [entry(updated_at="2026-09-09T23:40:00-01:00")])
    [account] = JsonlFeedSource(path).accounts()
    assert account.updated_on == date(2026, 9, 10)


def test_blank_lines_and_extra_fields_are_ignored(tmp_path):
    path = write_feed(tmp_path, [entry(id=1, segment="smb"), "", "   ", entry(id=2)])
    assert [account.account_id for account in JsonlFeedSource(path).accounts()] == [1, 2]


def test_invalid_json_names_the_file_and_line(tmp_path):
    path = write_feed(tmp_path, [entry(id=1), '{"id": 2, "name": "Harbor', entry(id=3)])
    with pytest.raises(FeedError) as caught:
        list(JsonlFeedSource(path).accounts())
    assert caught.value.line == 2
    assert str(caught.value).startswith(f"{path}:2: invalid JSON")


def test_missing_fields_are_reported(tmp_path):
    path = write_feed(tmp_path, ['{"id": 4, "name": "Harbor Supplies", "country": "NL", "status": "active"}'])
    with pytest.raises(FeedError, match=r":1: missing updated_at$"):
        list(JsonlFeedSource(path).accounts())


def test_timestamp_without_offset_is_rejected(tmp_path):
    path = write_feed(tmp_path, [entry(updated_at="2026-09-03T08:15:00")])
    with pytest.raises(FeedError, match="updated_at has no UTC offset"):
        list(JsonlFeedSource(path).accounts())
