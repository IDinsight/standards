from app.utils.pagination import clamp_page


def test_limit_is_capped():
    assert clamp_page(0, 500, 100) == (0, 100)


def test_negative_offset_becomes_zero():
    assert clamp_page(-5, 10, 100) == (0, 10)


def test_limit_is_at_least_one():
    assert clamp_page(0, 0, 100) == (0, 1)
