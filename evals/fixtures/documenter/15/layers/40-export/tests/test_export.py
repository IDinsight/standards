import pytest

from catalog.export import export_csv
from catalog.store import Record, RecordStore


def test_header_and_rows_in_given_order():
    records = [Record(2, "Vendor checklist", "li"), Record(1, "Lease agreement", "dana", "archived")]
    assert export_csv(records) == (
        "id,title,owner,status\n"
        "2,Vendor checklist,li,active\n"
        "1,Lease agreement,dana,archived\n"
    )


def test_no_records_gives_header_only():
    assert export_csv([]) == "id,title,owner,status\n"


def test_fields_with_commas_quotes_and_newlines_are_quoted():
    records = [
        Record(1, "Lease agreement, Building B", "dana"),
        Record(2, 'Q2 "priority" accounts review', "li"),
        Record(3, "Office move\nphase two", "marco"),
    ]
    assert export_csv(records) == (
        "id,title,owner,status\n"
        '1,"Lease agreement, Building B",dana,active\n'
        '2,"Q2 ""priority"" accounts review",li,active\n'
        '3,"Office move\nphase two",marco,active\n'
    )


def test_filtered_store_export():
    store = RecordStore([
        Record(3, 'Q2 "priority" accounts review', "dana", "archived"),
        Record(2, "Vendor checklist", "li"),
        Record(1, "Lease agreement, Building B", "dana"),
    ])
    assert export_csv(store.list(owner="dana")) == (
        "id,title,owner,status\n"
        '1,"Lease agreement, Building B",dana,active\n'
        '3,"Q2 ""priority"" accounts review",dana,archived\n'
    )


def test_selected_columns():
    records = [Record(1, "Lease agreement", "dana")]
    assert export_csv(records, columns=("title", "owner")) == "title,owner\nLease agreement,dana\n"


def test_unknown_column_rejected():
    with pytest.raises(ValueError, match="unknown column: due"):
        export_csv([], columns=("id", "due"))


def test_empty_columns_rejected():
    with pytest.raises(ValueError, match="at least one column is required"):
        export_csv([], columns=())
