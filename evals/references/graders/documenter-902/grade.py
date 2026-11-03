"""documenter-902 (Doc2): no document, API contract, or sample configuration changed.

Runs in the runner image on a copy of the finished project with its .git,
which is the working directory. git lists every file that differs from HEAD,
tracked or not; the check fails on any README.md, docs/ file, openapi.yaml,
.env.example, or other Markdown file outside .standards/, .claude/, and
.agents/. When git cannot answer, the check gets no verdict (an ERROR, not a
FAIL). Prints one GRADER_RESULT line.
"""
import json
import re
import subprocess

DOCUMENT = re.compile(r"(^|/)(openapi\.ya?ml|\.env\.example)$|^docs/|\.md$", re.I)
FRAMEWORK = (".standards/", ".claude/", ".agents/")


def changed_paths():
    r = subprocess.run(["git", "-c", "safe.directory=*", "-c", "core.quotepath=off", "status", "--porcelain=v1", "-z", "--untracked-files=all"],
                       capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        return None
    out, entries = [], r.stdout.split("\0")
    i = 0
    while i < len(entries):
        entry = entries[i]
        i += 1
        if len(entry) < 4:
            continue
        out.append(entry[3:])
        if entry[0] in "RC":  # a rename or copy: the next entry is the old path
            out.append(entries[i])
            i += 1
    return out


def main():
    paths = changed_paths()
    checks = []
    if paths is not None:
        docs = sorted({p for p in paths if DOCUMENT.search(p) and not p.startswith(FRAMEWORK)})
        checks.append({"id": "no-doc-change", "verdict": "FAIL" if docs else "PASS",
                       "detail": f"changed: {', '.join(docs)}" if docs else "no document, contract, or sample configuration changed"})
    print("GRADER_RESULT " + json.dumps({"checks": checks}))


if __name__ == "__main__":
    main()
