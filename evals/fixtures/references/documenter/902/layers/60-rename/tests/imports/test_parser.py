import io

import pytest

from app.imports.parser import ImportRow, ParseError, parse_csv


def rows(text):
    return parse_csv(io.StringIO(text, newline=""))


def test_parses_rows_with_line_numbers():
    assert rows("sku,name,quantity\nA-1,Widget,3\nB-2, Gadget ,10\n") == [
        ImportRow(2, "A-1", "Widget", 3),
        ImportRow(3, "B-2", "Gadget", 10),
    ]


def test_skips_empty_rows_and_ignores_extra_columns():
    text = "sku,name,quantity,notes\nA-1,Widget,3,first\n,,,\nB-2,Gadget,1,\n"
    assert rows(text) == [ImportRow(2, "A-1", "Widget", 3), ImportRow(4, "B-2", "Gadget", 1)]


def test_missing_column_is_reported():
    with pytest.raises(ParseError, match="missing column: quantity"):
        rows("sku,name\nA-1,Widget\n")


def test_non_integer_quantity_reports_line():
    with pytest.raises(ParseError, match="line 3: quantity must be an integer"):
        rows("sku,name,quantity\nA-1,Widget,3\nB-2,Gadget,many\n")


def test_empty_file_is_rejected():
    with pytest.raises(ParseError, match="file is empty"):
        rows("")
