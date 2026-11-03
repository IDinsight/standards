<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: json-stock-summary-20260923T101500Z-5c2e9a17
-->

# Development Plan

`Cycle`: `json-stock-summary-20260923T101500Z-5c2e9a17` `Mode`: `STEPWISE`
`User Style`: `tony.md.md` `User Style Locked`: `false` `Status`: `PROPOSED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/json-stock-summary-20260923T101500Z-5c2e9a17.md`
- `Architecture`: `.standards/docs/specs/json-stock-summary-20260923T101500Z-5c2e9a17.md`
- `Request`: `Add a JSON output option to the stock summary command.`

## Build Steps

### DEV-001 — JSON formatter for the stock summary

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Add `format_json(summary)` to the report module so a summary built by
`build_summary` renders as the JSON object the design specifies.

**Affected Area**

`inventory/report.py` (MODIFY). `build_summary` and `format_text` stay as they
are.

**Expected Outcome**

`format_json(build_summary(items))` returns `json.dumps(summary, indent=2)`: one
JSON object with `total_items`, `total_units`, and `low_stock` in that order,
`low_stock` listing SKUs in input order, with no trailing newline. The command's
output is unchanged until DEV-002 wires the option.

**Self-Check**

Planned, not yet run: `python3 -m pytest -q` from the repository root (existing
suite still passes), then a `python3 -c` check that
`json.loads(format_json(build_summary(load_items("samples/stock.csv"))))` equals
`build_summary` of the same file.

---

### DEV-002 — `--format` option on the summary command

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Let `inventory summary` print either the existing text report or the JSON
rendering from DEV-001.

**Affected Area**

`inventory/cli.py` (MODIFY).

**Expected Outcome**

The `summary` subcommand accepts `--format` with argparse choices `text` and
`json`, defaulting to `text`. `json` prints `format_json(summary)`; `text` and no
option print `format_text(summary)` exactly as before; any other value exits
with status 2 and argparse's usage error.

**Self-Check**

Planned, not yet run: `python3 -m pytest -q`; then
`python3 -m inventory summary samples/stock.csv` with no option, `--format text`,
`--format json`, and `--format xml` (expect exit status 2).

---

## Plan Notes

- Steps follow the design's Build Plan order; DEV-002 calls `format_json` from
  DEV-001.
- Project references loaded: `NONE` (no `.standards/project-references/developer/`
  folder).
