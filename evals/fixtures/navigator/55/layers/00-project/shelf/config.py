"""Server settings."""

import os

DEFAULTS = {"host": "127.0.0.1", "port": 8080, "debug": False}
ENV_PREFIX = "SHELF_"


def from_env(environ):
    """Collect SHELF_* variables as lowercase setting names."""
    values = {}
    for key, raw in environ.items():
        if key.startswith(ENV_PREFIX):
            values[key[len(ENV_PREFIX):].lower()] = raw
    return values


def coerce(settings):
    result = dict(settings)
    result["port"] = int(result["port"])
    debug = result["debug"]
    if isinstance(debug, str):
        debug = debug.strip().lower() in ("1", "true", "yes", "on")
    result["debug"] = debug
    return result


def load(environ=None):
    """Return the effective settings.

    Environment variables take precedence over the defaults.
    """
    environ = os.environ if environ is None else environ
    settings = dict(DEFAULTS)
    settings.update(from_env(environ))
    return coerce(settings)
