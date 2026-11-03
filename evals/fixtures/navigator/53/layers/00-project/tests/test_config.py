import json

import pytest

from notifier.config import load_config


def test_defaults_when_nothing_is_set():
    config = load_config(environ={})
    assert config.webhook_url == "http://localhost:8080/hooks"
    assert config.timeout == 5.0
    assert config.max_attempts == 3
    assert config.backoff == 0.5


def test_file_values_override_defaults(tmp_path):
    path = tmp_path / "notifier.json"
    path.write_text(json.dumps({"timeout": 2, "max_attempts": 5}))
    config = load_config(str(path), environ={})
    assert config.timeout == 2.0
    assert config.max_attempts == 5
    assert config.backoff == 0.5


def test_environment_overrides_file(tmp_path):
    path = tmp_path / "notifier.json"
    path.write_text(json.dumps({"timeout": 2}))
    config = load_config(str(path), environ={"NOTIFIER_TIMEOUT": "7.5"})
    assert config.timeout == 7.5


def test_config_path_from_environment(tmp_path):
    path = tmp_path / "notifier.json"
    path.write_text(json.dumps({"webhook_url": "http://hooks.test/a"}))
    config = load_config(environ={"NOTIFIER_CONFIG": str(path)})
    assert config.webhook_url == "http://hooks.test/a"


def test_unknown_file_key_is_rejected(tmp_path):
    path = tmp_path / "notifier.json"
    path.write_text(json.dumps({"retries": 4}))
    with pytest.raises(ValueError, match="unknown config keys: retries"):
        load_config(str(path), environ={})
