import pytest

from durfmt import format_duration, parse


def test_compound():
    assert format_duration(5400) == "1h30m"


def test_zero():
    assert format_duration(0) == "0s"


def test_largest():
    assert format_duration(90000, largest="h") == "25h"


def test_round_trip():
    for text in ["1d", "3h5s", "2d1h1m1s"]:
        assert format_duration(parse(text)) == text


def test_negative():
    with pytest.raises(ValueError):
        format_duration(-1)
