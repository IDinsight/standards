<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-csv-export-command-for-inventory-20260921T141205Z-5c81e2a7
-->

# Development Plan

`Cycle`: `add-a-csv-export-command-for-inventory-20260921T141205Z-5c81e2a7`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-a-csv-export-command-for-inventory-20260921T141205Z-5c81e2a7.md`
- `Architecture`:
  `.standards/docs/specs/add-a-csv-export-command-for-inventory-20260921T141205Z-5c81e2a7.md`
- `Request`: `Add a CSV export command for inventory items.`

## Build Steps

### DEV-001 — CSV serializer

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Add `toCsv(items)` producing RFC 4180 CSV with the fixed `sku,name,quantity`
header.

**Affected Area**

`src/export.js` (new).

**Expected Outcome**

`toCsv` returns a header row and one CRLF-terminated line per item, quoting
fields that contain commas, double quotes, or line breaks and doubling embedded
quotes.

**Self-Check**

`node --test test/inventory.test.js` in the project root on the working tree
before commit: exit 0, 3 passes (existing behavior unaffected). Called `toCsv`
from a Node REPL with a name containing a comma and a double quote; the field
was quoted and the quote doubled.

### DEV-002 — Export subcommand

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-003`

**Goal**

Expose the serializer as `stockroom export <file> [--below <n>]`.

**Affected Area**

`src/cli.js` (`run` dispatcher and usage string).

**Expected Outcome**

`export` writes all items, or only those below `--below`, as CSV to the `out`
stream; `list` and `low` are unchanged.

**Self-Check**

`node src/cli.js export test/data/items.json --below 5` in the project root on
the working tree before commit: printed the header and the `SKU-1002` line,
exit 0. `node src/cli.js list test/data/items.json`: same three tab-separated
lines as before the change, exit 0. `node --test test/inventory.test.js`: exit
0, 3 passes.

## Plan Notes

- Project references loaded: `NONE`.
- AC-004 (root README) is Documenter-owned and has no build step.
