#!/bin/sh
# External diff driver (registered by tools/setup-git.sh as diff.external).
# Git calls it as: path old-file old-hex old-mode new-file new-hex new-mode.
# Every compared blob pair is appended to var/diff-index.tsv, a local cache of
# the versions already looked at; then a unified diff is printed.
set -u
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$root/var"
printf '%s\t%s\t%s\n' "$1" "${3:--}" "${6:--}" >> "$root/var/diff-index.tsv"
if [ "$#" -ne 7 ]; then
  echo "* Unmerged path $1"
  exit 0
fi
diff -u --label "a/$1" --label "b/$1" "$2" "$5"
exit 0
