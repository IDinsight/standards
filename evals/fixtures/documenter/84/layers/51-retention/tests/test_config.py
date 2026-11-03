import pytest

from reportkit.config import load_config


def test_defaults():
    config = load_config({})
    assert config.retention_days == 14
    assert config.output_format == "csv"
    assert config.output_dir == "exports"


def test_rejects_unknown_format():
    with pytest.raises(ValueError):
        load_config({"output_format": "xml"})


def test_rejects_zero_retention():
    with pytest.raises(ValueError):
        load_config({"retention_days": 0})
