#!/bin/sh
# Format project Markdown and check relative links.
# Used by `make lint` and `npm run lint`.
set -e

mkdir -p .lint
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) lint" >> .lint/last-run.log

npx --yes prettier@3.3.3 --write "*.md" "docs/**/*.md"
node scripts/check-links.mjs
