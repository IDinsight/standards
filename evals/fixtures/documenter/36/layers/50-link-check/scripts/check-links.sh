#!/bin/sh
# Link check for the Markdown docs: relative links, heading anchors, and every
# published http(s) URL. Settings are in lychee.toml.
set -eu
cd "$(dirname "$0")/.."
exec lychee --no-progress --config lychee.toml --include-fragments README.md docs/*.md
