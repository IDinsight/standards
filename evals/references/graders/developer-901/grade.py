"""developer-901 (D1, account lockout): hidden service tests and router checks.

Runs in the runner image (Python 3.11 and pytest) on a throwaway copy of the
finished project, which is the working directory, with no network. The hidden
tests in hidden/ import only app.services, through the interface the approved
design names (AccountLockedError and authenticate_user in app/services/auth.py),
so a run without that interface fails every test. Third-party packages the
project declares but the image lacks are stood in for (hidden/conftest.py).
The router checks read the code without running it. Prints one GRADER_RESULT
line.
"""
import ast
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

GRADER = Path(__file__).resolve().parent
PROJECT = Path.cwd()

# Each check the hidden tests decide, and its tests: all must pass.
TESTS = {
    "unknown-email-locks": ["test_known_email_locks", "test_unknown_email_locks"],
    "store-failure-refuses": ["test_store_failure_refuses"],
    "locks-by-email": ["test_failures_from_many_addresses_lock_the_email", "test_failures_do_not_lock_another_email"],
    "success-clears": ["test_success_clears_failures", "test_five_failures_after_a_success_lock"],
    "window-restarts": ["test_each_failure_restarts_the_window"],
    "same-failure": ["test_unknown_email_and_wrong_password_look_the_same"],
}


def run_hidden_tests():
    """Each hidden test's outcome by name ("passed" or a short reason), or a note when pytest could not report."""
    work = Path(tempfile.mkdtemp(prefix="hidden-"))
    shutil.copytree(GRADER / "hidden", work, dirs_exist_ok=True)
    # An empty config of its own, so the project's pytest settings and conftest files play no part.
    (work / "pytest.ini").write_text("[pytest]\n")
    report = work / "report.xml"
    env = {**os.environ, "PYTHONPATH": os.pathsep.join(filter(None, [str(PROJECT), os.environ.get("PYTHONPATH")])), "PYTHONDONTWRITEBYTECODE": "1"}
    cmd = [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", "-c", str(work / "pytest.ini"),
           "--rootdir", str(work), f"--junitxml={report}", str(work)]
    try:
        r = subprocess.run(cmd, cwd=work, env=env, capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        return {}, "the hidden tests did not finish within 120 seconds"
    if not report.exists():
        return {}, f"pytest wrote no report: {(r.stdout + r.stderr)[-400:]}"
    outcomes = {}
    for case in ET.parse(report).getroot().iter("testcase"):
        name = case.get("name", "").split("[")[0]
        bad = next((c for c in case if c.tag in ("failure", "error", "skipped")), None)
        outcomes[name] = "passed" if bad is None else f"{bad.tag}: {(bad.get('message') or bad.text or '').strip()[:240]}"
    wanted = {t for tests in TESTS.values() for t in tests}
    if not wanted & outcomes.keys():
        # Collection failed, for example when the design's interface is missing.
        reason = next(iter(outcomes.values()), "") or (r.stdout + r.stderr)[-400:]
        return {}, f"no hidden test ran: {reason}"
    return outcomes, None


def parsed_sources():
    """(path, source, tree) for each Python file under app/ that parses."""
    out = []
    for f in sorted((PROJECT / "app").rglob("*.py")):
        try:
            src = f.read_text(encoding="utf-8")
            out.append((f, src, ast.parse(src)))
        except (OSError, UnicodeDecodeError, SyntaxError):
            continue
    return out


def names_locked_error(node):
    return any((isinstance(n, ast.Name) and n.id == "AccountLockedError") or (isinstance(n, ast.Attribute) and n.attr == "AccountLockedError")
               for n in ast.walk(node))


def lockout_handlers():
    """Source of every place that turns AccountLockedError into a response:
    except clauses, functions registered with exception_handler or
    add_exception_handler."""
    segments = []
    for _, src, tree in parsed_sources():
        functions = {n.name: n for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler) and node.type is not None and names_locked_error(node.type):
                segments.append(ast.get_source_segment(src, node) or "")
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for d in node.decorator_list:
                    if isinstance(d, ast.Call) and getattr(d.func, "attr", "") == "exception_handler" and any(names_locked_error(a) for a in d.args):
                        segments.append(ast.get_source_segment(src, node) or "")
            elif isinstance(node, ast.Call) and getattr(node.func, "attr", "") == "add_exception_handler" and len(node.args) >= 2 and names_locked_error(node.args[0]):
                handler = node.args[1]
                if isinstance(handler, ast.Name) and handler.id in functions:
                    segments.append(ast.get_source_segment(src, functions[handler.id]) or "")
    return segments


def main():
    checks = []
    outcomes, note = run_hidden_tests()
    for check, tests in TESTS.items():
        if note:
            checks.append({"id": check, "verdict": "FAIL", "detail": f"the hidden tests could not run: {note}"})
            continue
        failed = [f"{t}: {outcomes.get(t, 'did not run')}" for t in tests if outcomes.get(t) != "passed"]
        checks.append({"id": check, "verdict": "FAIL" if failed else "PASS", "detail": "; ".join(failed) if failed else f"{', '.join(tests)} passed"})

    # same-failure also needs the router's single 401 for rejected credentials.
    router = PROJECT / "app" / "routers" / "auth.py"
    router_src = router.read_text(encoding="utf-8") if router.exists() else ""
    if not re.search(r"\b401\b|HTTP_401", router_src):
        same = next(c for c in checks if c["id"] == "same-failure")
        same.update(verdict="FAIL", detail=f"{same['detail']}; app/routers/auth.py no longer answers rejected credentials with 401")

    # router-429: a handler of AccountLockedError answers 429 with Retry-After.
    handlers = lockout_handlers()
    good = [h for h in handlers if re.search(r"\b429\b|HTTP_429|TOO_MANY_REQUESTS", h) and re.search(r"retry-after", h, re.I)]
    checks.append({"id": "router-429", "verdict": "PASS" if good else "FAIL",
                   "detail": "a handler of AccountLockedError answers 429 with Retry-After" if good else
                   (f"{len(handlers)} handler(s) of AccountLockedError, none with both 429 and Retry-After" if handlers else "nothing handles AccountLockedError")})
    print("GRADER_RESULT " + json.dumps({"checks": checks}))


if __name__ == "__main__":
    main()
