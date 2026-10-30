#!/bin/sh
# Text converter for tab-separated rate tables (selected in .gitattributes,
# registered by tools/setup-git.sh). Pads every column to a fixed width so a
# price change shows up as one changed row in a diff.
# The rendering is written to var/textconv/view.txt, then printed.
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$root/var/textconv"
out="$root/var/textconv/view.txt"
awk -F '\t' '{ line = ""; for (i = 1; i <= NF; i++) line = line sprintf("%-12s", $i); sub(/ +$/, "", line); print line }' "$1" > "$out"
cat "$out"
