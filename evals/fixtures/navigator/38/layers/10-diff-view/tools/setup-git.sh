#!/bin/sh
# Register the repository's diff helpers in this clone's .git/config.
set -eu
cd "$(dirname -- "$0")/.."
git config diff.external tools/ext-diff.sh
git config diff.tsv.textconv tools/tsv-view.sh
echo "Diff helpers registered for $(pwd)"
