from timer.durations import parse_duration


def test_units():
    assert parse_duration("30s") == 30
    assert parse_duration("5m") == 300
    assert parse_duration("2h") == 7200


def test_bare_number_is_minutes():
    assert parse_duration("90") == 5400
