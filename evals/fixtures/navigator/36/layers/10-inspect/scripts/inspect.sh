#!/bin/sh
# Project diagnostic: report on the ledger data using the platform probe.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
probe="$root/tools/ledger-probe/ledger-probe"

if [ ! -x "$probe" ]; then
  echo "inspect: ledger-probe not installed at $probe (see README)" >&2
  exit 1
fi

exec "$probe" status --data "$root/data" "$@"
