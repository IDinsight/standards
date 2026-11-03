<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-json-option-that-prints-counts-as-20260923T141000Z-5c8e2a91
-->

# Development Plan

`Cycle`: `add-a-json-option-that-prints-counts-as-20260923T141000Z-5c8e2a91` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-a-json-option-that-prints-counts-as-20260923T141000Z-5c8e2a91.md`
- `Architecture`: `.standards/docs/specs/add-a-json-option-that-prints-counts-as-20260923T141000Z-5c8e2a91.md`
- `Request`: `Add a --json option that prints counts as JSON.`

## Build Steps

### DEV-001 — JSON Lines formatter for count results

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Serialize one count result as a single-line JSON object, with keys in the order the design fixes.

**Affected Area**

New module `src/format.js`. No existing file changes.

**Expected Outcome**

`toJsonLine(counts, name)` returns a single-line object with the keys file, lines, words, and chars. The file name is null when `name` is null or undefined.

**Self-Check**

Run a one-off `node -e` import of `toJsonLine` with sample counts, with and without a file name, and run `node --test test/count.test.js test/cli.test.js` in the project root.

### DEV-002 — `--json` option in the CLI

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Accept `--json` and print one `toJsonLine` result per input in place of table rows.

**Affected Area**

`parseArgs` and `run` in `src/cli.js`.

**Expected Outcome**

`parseArgs` reports whether `--json` was given. `run` writes one JSON line per file, or one with a null file name for standard input. Output without `--json` is unchanged, and other unknown options are still rejected with exit status 2.

**Self-Check**

Run `node --test test/count.test.js test/cli.test.js` in the project root. Also run `node bin/tally.js --json README.md`, `printf 'a b\n' | node bin/tally.js --json`, and `node bin/tally.js README.md` by hand, and compare the last with the previous output.

## Plan Notes

- AC-004 (usage guide) has no Developer step; the design assigns it to the documentation phase.
