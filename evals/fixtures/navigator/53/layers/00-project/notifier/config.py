import json
import os
from dataclasses import dataclass

DEFAULTS = {
    "webhook_url": "http://localhost:8080/hooks",
    "timeout": 5.0,
    "max_attempts": 3,
    "backoff": 0.5,
}

ENV_PREFIX = "NOTIFIER_"


@dataclass(frozen=True)
class Config:
    webhook_url: str
    timeout: float
    max_attempts: int
    backoff: float


def _from_env(environ):
    values = {}
    for key in DEFAULTS:
        raw = environ.get(ENV_PREFIX + key.upper())
        if raw is not None:
            values[key] = raw
    return values


def _coerce(values):
    return {
        "webhook_url": str(values["webhook_url"]),
        "timeout": float(values["timeout"]),
        "max_attempts": int(values["max_attempts"]),
        "backoff": float(values["backoff"]),
    }


def load_config(path=None, environ=None):
    """Build a Config from defaults, an optional JSON file, and the environment."""
    environ = os.environ if environ is None else environ
    values = dict(DEFAULTS)
    path = path or environ.get("NOTIFIER_CONFIG")
    if path:
        with open(path, encoding="utf-8") as fh:
            file_values = json.load(fh)
        unknown = set(file_values) - set(DEFAULTS)
        if unknown:
            raise ValueError(f"unknown config keys: {', '.join(sorted(unknown))}")
        values.update(file_values)
    values.update(_from_env(environ))
    return Config(**_coerce(values))
