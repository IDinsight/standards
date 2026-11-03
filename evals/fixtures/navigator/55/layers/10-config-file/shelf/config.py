"""Server settings."""

import configparser
import os

DEFAULTS = {"host": "127.0.0.1", "port": 8080, "debug": False}
ENV_PREFIX = "SHELF_"
CONFIG_FILE = "shelf.ini"


def from_env(environ):
    """Collect SHELF_* variables as lowercase setting names."""
    values = {}
    for key, raw in environ.items():
        if key.startswith(ENV_PREFIX):
            values[key[len(ENV_PREFIX):].lower()] = raw
    return values


def from_file(path):
    """Read the [server] section of an INI file."""
    parser = configparser.ConfigParser()
    parser.read(path)
    if not parser.has_section("server"):
        return {}
    return dict(parser["server"])


def coerce(settings):
    result = dict(settings)
    result["port"] = int(result["port"])
    debug = result["debug"]
    if isinstance(debug, str):
        debug = debug.strip().lower() in ("1", "true", "yes", "on")
    result["debug"] = debug
    return result


def load(path=CONFIG_FILE, environ=None):
    """Return the effective settings.

    Values from the config file override the defaults, and environment
    variables take precedence over both.
    """
    environ = os.environ if environ is None else environ
    settings = dict(DEFAULTS)
    settings.update(from_env(environ))
    if os.path.exists(path):
        settings.update(from_file(path))
    return coerce(settings)
