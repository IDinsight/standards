import pytest

from convert_legacy import convert, parse_row

ROW = {"Ref": "4", "Title": " Insurance renewal 2026 ", "Owner": "Marco", "Archived": "n", "Created": "18/04/2026 16:20"}


def test_parse_row_normalizes_fields():
    assert parse_row(ROW) == {
        "id": 4,
        "title": "Insurance renewal 2026",
        "owner": "marco",
        "status": "active",
        "createdAt": "2026-04-18T16:20:00Z",
    }


def test_archived_flag():
    assert parse_row({**ROW, "Archived": "Y"})["status"] == "archived"


def test_convert_orders_by_id():
    lines = [
        "Ref\tTitle\tOwner\tArchived\tCreated\n",
        "5\tData retention policy\tli\tY\t06/05/2026 11:00\n",
        "2\tVendor onboarding checklist\tli\tN\t09/03/2026 14:40\n",
    ]
    assert [record["id"] for record in convert(lines)] == [2, 5]


def test_bad_reference_is_rejected():
    with pytest.raises(ValueError):
        parse_row({**ROW, "Ref": "x4"})
