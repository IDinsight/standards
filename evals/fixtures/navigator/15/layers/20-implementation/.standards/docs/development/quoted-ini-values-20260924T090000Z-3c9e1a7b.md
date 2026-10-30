<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: quoted-ini-values-20260924T090000Z-3c9e1a7b
-->

# Development Plan

`Cycle`: `quoted-ini-values-20260924T090000Z-3c9e1a7b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/quoted-ini-values-20260924T090000Z-3c9e1a7b.md`
- `Architecture`: `.standards/docs/specs/quoted-ini-values-20260924T090000Z-3c9e1a7b.md`
- `Request`: `Support double-quoted values with escapes in the INI parser.`

## Build Steps

### DEV-001 — Decode double-quoted values

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-004`

**Goal**

Return quoted values without their quotes, decoding the scoped escapes, while
leaving unquoted values untouched.

**Affected Area**

`src/parser.js`: new `parseValue` helper and `ESCAPES` table, called from
`parse` for every `key = value` line.

**Expected Outcome**

A value starting with a double quote is scanned up to its closing quote, with
inner whitespace kept and the quote, backslash, `n`, and `t` escapes decoded.
Any other value is stored exactly as before.

**Self-Check**

`node --test test/parser.test.js` in the project root on the working tree with
DEV-001 and DEV-002 applied, before commit: exit 0, 4 passed, 0 failed. A
manual `node -e` call on a padded quoted value with an escaped quote returned
the padding and the quote. Limitation: the existing suite does not exercise
quoted values; formal coverage is Tester-owned.

### DEV-002 — Reject malformed quoted values

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Report malformed quoted values as `ParseError`s naming the line.

**Affected Area**

`src/parser.js` (`parseValue`).

**Expected Outcome**

A missing closing quote, a trailing lone backslash, text after the closing
quote, and an escape outside the table each throw `ParseError` with the line
number; nothing is stored for that line.

**Self-Check**

Same run as DEV-001: exit 0, 4 passed. Manual `node -e` calls with an
unterminated value and an unknown escape each threw `ParseError` with
`line 1:` in the message.

## Plan Notes

- The user approved the plan as proposed on 2026-09-24; both steps were
  implemented in one change.
