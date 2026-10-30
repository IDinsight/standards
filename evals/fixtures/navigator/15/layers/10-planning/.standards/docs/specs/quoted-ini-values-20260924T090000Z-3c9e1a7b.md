<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: quoted-ini-values-20260924T090000Z-3c9e1a7b
-->

# Technical Design

## Context

`parse` in `src/parser.js` trims the text after the first `=` and stores it.
Errors use `ParseError` with `line N: <reason>` messages (see
`.standards/CONTEXT.md`).

## Decision

Add a private `parseValue(raw, line)` helper in `src/parser.js`, called on the
trimmed text after `=`. If the text does not start with `"`, it is returned
unchanged. Otherwise it is scanned character by character up to the closing
quote, decoding escapes from a fixed table. A small hand-written scanner keeps
the rules explicit and avoids regular-expression edge cases.

## Acceptance Coverage

- `AC-001`: `parseValue` returns the characters between the opening and
  closing quotes; trimming happens before the quotes are seen, so inner
  whitespace survives.
- `AC-002`: fixed escape table for quote, backslash, `n`, and `t`.
- `AC-003`: `parseValue` throws `ParseError` with the current line for a
  missing closing quote (including a trailing lone backslash), any text after
  the closing quote, and any escape not in the table.
- `AC-004`: values not starting with `"` bypass the scanner.

## Interfaces and Contracts

- `parse(text)` keeps its signature and return shape; values stay strings.
- New error reasons: `unterminated quoted value`,
  `unexpected text after closing quote`, `unknown escape <sequence>`, all in
  the existing `line N: <reason>` form.

## Technical Acceptance Criteria

- `AC-003`: no partially decoded value is stored when an error is thrown.
- `AC-004`: the existing parser tests pass unchanged.

## Build Plan

1. Add `parseValue` with decoding.
2. Add the error cases.

## Alternatives

- `JSON.parse` on the quoted text: rejected because it accepts escapes outside
  the scoped set and reports positions rather than lines.
