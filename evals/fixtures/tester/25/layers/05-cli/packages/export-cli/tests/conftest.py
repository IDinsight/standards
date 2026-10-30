import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parents[1] / "src"


@pytest.fixture
def run_cli(tmp_path):
    """Run `python -m export_cli` in the test's temporary directory.

    The command gets a minimal environment, so variables such as RECORDS_FILE
    from the developer's shell never leak in; pass `env` to add some.
    """

    def run(*args, env=None, input=None):
        environment = {
            "PATH": os.environ.get("PATH", ""),
            "PYTHONPATH": str(SRC),
            "LANG": "C.UTF-8",
            "PYTHONDONTWRITEBYTECODE": "1",
        }
        environment.update(env or {})
        return subprocess.run(
            [sys.executable, "-m", "export_cli", *args],
            cwd=tmp_path,
            env=environment,
            input=input,
            capture_output=True,
            text=True,
            timeout=30,
        )

    return run


@pytest.fixture
def records_file(tmp_path):
    """Write a records dump into the test's temporary directory."""

    def write(records, name="records.json"):
        path = tmp_path / name
        path.write_text(json.dumps(records), encoding="utf-8")
        return path

    return write
