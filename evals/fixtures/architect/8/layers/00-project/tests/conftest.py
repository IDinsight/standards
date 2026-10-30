import pytest


@pytest.fixture(autouse=True)
def isolated_config(tmp_path, monkeypatch):
    directory = tmp_path / "config"
    monkeypatch.setenv("LEDGERCTL_CONFIG_DIR", str(directory))
    monkeypatch.delenv("LEDGERCTL_TOKEN", raising=False)
    return directory
