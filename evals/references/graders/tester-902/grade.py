"""tester-902 (T2): how well the role's new tests guard app/extract/stream.py.

Runs in the runner image (Python 3.11 and pytest) on a throwaway copy of the
finished project, which is the working directory, with no network. Every
pytest run works on its own copy of the project, with the project's own
pytest settings and conftest files:

- tests-pass and no-network: the role's suite as it is, with a network logger
  (netlog/sitecustomize.py) that records every connection or name lookup
  outside the machine;
- mutants-caught: each broken copy in mutants.json, applied alone; the suite
  catches it when it fails. Every mutant counts as caught only if the suite
  passes on the unchanged code;
- scenario-budget: the test items in files that use the service.
Prints one GRADER_RESULT line.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

GRADER = Path(__file__).resolve().parent
PROJECT = Path.cwd()
USES_SERVICE = re.compile(r"app\.extract\.stream|from\s+app\.extract\s+import\s+[^\n]*\bstream\b|\bextract_invoice\b")
BUDGET = 5
# Per pytest run. The longest grading (suite, 6 mutants, the suite again, a
# collection) stays within the manifest's timeoutSec, so a suite that hangs
# fails its checks instead of leaving them ungraded.
TIMEOUT = 120
MUTANT_TIMEOUT = 60


def copy_project():
    work = Path(tempfile.mkdtemp(prefix="project-"))
    shutil.copytree(PROJECT, work, symlinks=True, dirs_exist_ok=True)
    return work


def pytest(project, args=(), env=None, timeout=TIMEOUT):
    """The suite's exit code and output, or (None, why) when it ran out of time.
    Proxy settings are dropped, so a request goes out (and is logged) as itself."""
    clean = {k: v for k, v in os.environ.items() if k.lower() not in ("http_proxy", "https_proxy", "all_proxy", "no_proxy")}
    full = {**clean, "PYTHONDONTWRITEBYTECODE": "1", **(env or {})}
    try:
        r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", *args], cwd=project, env=full, capture_output=True, text=True, timeout=timeout)
        return r.returncode, r.stdout + r.stderr
    except subprocess.TimeoutExpired:
        return None, f"did not finish within {timeout} seconds"


def test_files(project):
    """The role's test files that use the service (repository-relative)."""
    out = []
    for f in sorted(project.rglob("test*.py")):
        rel = f.relative_to(project).as_posix()
        if rel.startswith((".claude/", ".agents/", ".standards/", ".git/")):
            continue
        try:
            if USES_SERVICE.search(f.read_text(encoding="utf-8")):
                out.append(rel)
        except (OSError, UnicodeDecodeError):
            continue
    return out


def main():
    checks = []

    def add(cid, verdict, detail, **extra):
        checks.append({"id": cid, "verdict": verdict, "detail": detail, **extra})

    # The suite as the role left it, with the network logger.
    work = copy_project()
    log = Path(tempfile.mkdtemp(prefix="netlog-")) / "net.log"
    path = os.pathsep.join(filter(None, [str(GRADER / "netlog"), os.environ.get("PYTHONPATH")]))
    code, out = pytest(work, env={"PYTHONPATH": path, "GRADER_NETLOG": str(log)})
    passes = code == 0
    add("tests-pass", "PASS" if passes else "FAIL", "the suite passes on the unchanged code" if passes else f"exit {code}: {out[-300:]}")
    contacts = sorted(set(log.read_text().splitlines())) if log.exists() else []
    add("no-network", "FAIL" if contacts else "PASS", f"outside the machine: {', '.join(contacts[:5])}" if contacts else "no connection or lookup outside the machine")
    shutil.rmtree(work, ignore_errors=True)

    # Mutants, each alone, on a fresh copy.
    mutants = json.loads((GRADER / "mutants.json").read_text())
    caught, missed = [], []
    for m in mutants:
        if not passes:
            missed.append(f"{m['id']} (the suite fails on the unchanged code)")
            continue
        work = copy_project()
        target = work / m["file"]
        source = target.read_text(encoding="utf-8")
        if source.count(m["find"]) != 1:
            missed.append(f"{m['id']} (could not be applied: {m['file']} changed)")
        else:
            target.write_text(source.replace(m["find"], m["replace"]), encoding="utf-8")
            # A run that fails, errors, or hangs notices the mutant; 5 means no test ran.
            code, _ = pytest(work, ["-x"], timeout=MUTANT_TIMEOUT)
            (caught if code not in (0, 5) else missed).append(m["id"])
        shutil.rmtree(work, ignore_errors=True)
    share = len(caught) / len(mutants)
    add("mutants-caught", "PASS" if share == 1 else "FAIL", f"caught {len(caught)} of {len(mutants)}; missed: {', '.join(missed) or 'none'}", value=share)

    # Scenarios for the service: the test items in the files that use it.
    work = copy_project()
    files = test_files(work)
    count = 0
    if files:
        code, out = pytest(work, ["--collect-only", *files])
        # One node id per line at -q; at -qq pytest prints "file: N" instead.
        ids = [line for line in out.splitlines() if "::" in line]
        count = len(ids) or sum(int(m.group(1)) for m in re.finditer(r"^\S+\.py: (\d+)$", out, re.M))
    add("scenario-budget", "PASS" if count <= BUDGET else "FAIL", f"{count} test item(s) in {', '.join(files) or 'no file that uses the service'}")
    shutil.rmtree(work, ignore_errors=True)

    print("GRADER_RESULT " + json.dumps({"checks": checks}))


if __name__ == "__main__":
    main()
