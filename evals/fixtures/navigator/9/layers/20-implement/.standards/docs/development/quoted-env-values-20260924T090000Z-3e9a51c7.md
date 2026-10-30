<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: quoted-env-values-20260924T090000Z-3e9a51c7
-->

# Development Plan

`Cycle`: `quoted-env-values-20260924T090000Z-3e9a51c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/quoted-env-values-20260924T090000Z-3e9a51c7.md`
- `Architecture`: `.standards/docs/specs/quoted-env-values-20260924T090000Z-3e9a51c7.md`
- `Request`: `Support double-quoted values with escape sequences in the env parser.`

## Build Steps

### DEV-001 — Quoted value scanner

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Add `unquote` and the escape table to the parser.

**Affected Area**

`src/parser.js`

**Expected Outcome**

A value starting with `"` is returned without its quotes, with `\n`, `\t`,
`\"`, and `\\` decoded; unknown escapes, a missing closing quote, and
non-comment text after the closing quote raise `ParseError` with the line.

**Self-Check**

`npm test` in the project root: exit 0, 5 passes. Spot check with
`node --input-type=module -e` importing `parse` from `./src/parser.js`:
`A="x # y"` gave `x # y`, `A="a\nb"` gave a two-line value, `A="oops` and
`A="\q"` both threw `ParseError` with `line` 1. Assessed `src/parser.js` blob
`${BLOB:src/parser.js}`.

### DEV-002 — Keep the unquoted path

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-004`

**Goal**

Branch on a leading `"` so unquoted values still use `plainValue`.

**Affected Area**

`parse` in `src/parser.js`

**Expected Outcome**

Unquoted values, inline comments, trimming, and errors behave as before.

**Self-Check**

`npm test` in the project root on the same content: exit 0, 5 passes; the
existing tests cover the unquoted rules. `plainValue` is unchanged in the diff.
