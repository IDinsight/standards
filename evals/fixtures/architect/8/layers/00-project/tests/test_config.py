from ledgerctl import config


def test_defaults_when_file_missing():
    assert config.load_config() == config.DEFAULTS


def test_round_trip_keeps_defaults_for_unset_keys():
    config.save_config({"base_url": "https://ledger.internal.test"})
    loaded = config.load_config()
    assert loaded["base_url"] == "https://ledger.internal.test"
    assert loaded["default_format"] == "table"


def test_save_leaves_only_config_file(isolated_config):
    config.save_config({"default_format": "json"})
    config.save_config({"default_format": "table"})
    assert sorted(path.name for path in isolated_config.iterdir()) == ["config.json"]


def test_override_directory(isolated_config):
    assert config.config_dir() == isolated_config


def test_xdg_config_home(monkeypatch, tmp_path):
    monkeypatch.delenv("LEDGERCTL_CONFIG_DIR")
    monkeypatch.setenv("XDG_CONFIG_HOME", str(tmp_path / "xdg"))
    assert config.config_dir() == tmp_path / "xdg" / "ledgerctl"
