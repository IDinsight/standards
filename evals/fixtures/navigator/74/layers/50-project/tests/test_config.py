from pacer.config import load_settings


def test_missing_values_use_defaults():
    assert load_settings({}) == {"work": 1500, "break": 300}


def test_values_are_parsed():
    assert load_settings({"work": "50m", "break": "10m"}) == {"work": 3000, "break": 600}
