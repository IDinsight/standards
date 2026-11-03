import pytest

from app.filters import RecordFilter, parse_filter


def test_parse_filter_keeps_known_parameters_and_ignores_blanks():
    query = {"status": "archived", "owner": " dana ", "q": "", "page": "2"}
    assert parse_filter(query) == RecordFilter(status="archived", owner="dana")


def test_parse_filter_rejects_unknown_status():
    with pytest.raises(ValueError, match="unknown status: deleted"):
        parse_filter({"status": "deleted"})
