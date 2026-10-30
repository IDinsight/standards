"""Configuration directory and config.json handling."""

import json
import os
import tempfile
from pathlib import Path

DEFAULTS = {
    "base_url": "https://api.ledger.example.com",
    "default_format": "table",
}


def config_dir():
    override = os.environ.get("LEDGERCTL_CONFIG_DIR")
    if override:
        return Path(override)
    xdg = os.environ.get("XDG_CONFIG_HOME")
    base = Path(xdg) if xdg else Path.home() / ".config"
    return base / "ledgerctl"


def config_path():
    return config_dir() / "config.json"


def load_stored():
    try:
        with config_path().open(encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        return {}


def load_config():
    return {**DEFAULTS, **load_stored()}


def save_config(values):
    directory = config_dir()
    directory.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(dir=directory, prefix=".config-", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(values, handle, indent=2, sort_keys=True)
            handle.write("\n")
        os.replace(temp_name, config_path())
    except BaseException:
        if os.path.exists(temp_name):
            os.unlink(temp_name)
        raise
