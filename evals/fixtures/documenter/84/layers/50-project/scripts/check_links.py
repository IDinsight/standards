"""Report relative Markdown links that point at missing files."""
import pathlib
import re
import sys

LINK = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")


def broken_links(path):
    missing = []
    for target in LINK.findall(path.read_text(encoding="utf-8")):
        if "://" in target or target.startswith("mailto:"):
            continue
        if not (path.parent / target).exists():
            missing.append(target)
    return missing


def main(names):
    status = 0
    for name in names:
        for target in broken_links(pathlib.Path(name)):
            print(f"{name}: broken link {target}")
            status = 1
    if status == 0:
        print(f"checked {len(names)} file(s): no broken links")
    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
