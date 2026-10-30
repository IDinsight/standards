import pytest

from durfmt import DurationError, parse


def test_compound():
    assert parse("1h30m") == 5400


def test_spaces_and_case():
    assert parse(" 2D 4H ") == 2 * 86400 + 4 * 3600


def test_bare_seconds():
    assert parse("45") == 45


@pytest.mark.parametrize("bad", ["", "30m1h", "1h1h", "1x", "h"])
def test_rejects(bad):
    with pytest.raises(DurationError):
        parse(bad)
