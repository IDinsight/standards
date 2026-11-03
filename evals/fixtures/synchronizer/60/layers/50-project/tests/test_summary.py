import io

import pytest

from csvsum.summary import summarize

DATA = "name,amount,qty\nwidget,2.5,4\ngadget,,1\nbolt,7,n/a\n"


def test_all_columns_in_header_order():
    result = summarize(io.StringIO(DATA))
    assert list(result) == ["name", "amount", "qty"]
    assert result["name"] == {"count": 0}
    assert result["amount"] == {"count": 2, "min": 2.5, "max": 7.0, "mean": 4.75}
    assert result["qty"]["count"] == 2


def test_selected_columns_keep_given_order():
    result = summarize(io.StringIO(DATA), columns=["qty", "amount"])
    assert list(result) == ["qty", "amount"]
    assert result["qty"]["mean"] == 2.5


def test_unknown_column_raises():
    with pytest.raises(KeyError):
        summarize(io.StringIO(DATA), columns=["price"])


def test_semicolon_delimiter():
    result = summarize(io.StringIO("a;b\n1;2\n3;4\n"), delimiter=";")
    assert result["b"] == {"count": 2, "min": 2.0, "max": 4.0, "mean": 3.0}
