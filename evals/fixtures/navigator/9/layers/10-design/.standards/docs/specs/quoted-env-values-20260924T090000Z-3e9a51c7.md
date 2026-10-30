<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: quoted-env-values-20260924T090000Z-3e9a51c7
-->

# Technical Design

## Context

All format rules live in `parse` in `src/parser.js`. Unquoted values are
handled by `plainValue`, which trims and cuts at an inline comment.

## Decision

After splitting a line at the first `=`, `parse` checks whether the trimmed
value starts with `"`. If it does, a new `unquote(raw, line)` function scans
the value character by character; otherwise `plainValue` is used unchanged.
A single-pass scanner keeps escape handling and the closing-quote position in
one place.

## Acceptance Coverage

- `AC-001`: `unquote` returns the characters between the opening quote and the
  first unescaped closing quote; inline-comment and trimming rules do not apply
  inside the quotes.
- `AC-002`: `unquote` decodes the escape table `n`, `t`, `"`, `\` and throws
  `ParseError` for any other character after a backslash, including a
  backslash at the end of the value.
- `AC-003`: `unquote` throws `ParseError` when no closing quote is found, and
  when the text after the closing quote is not empty and does not start with
  `#`.
- `AC-004`: the unquoted branch still calls the existing `plainValue`.

## Interfaces and Contracts

- `parse(text)` keeps its signature and return shape; `ParseError` keeps its
  `line` property and `line N:` message prefix.

## Technical Acceptance Criteria

- `AC-002`, `AC-003`: every rejection is a `ParseError` whose `line` is the
  line of the offending value.
- `AC-004`: no change to `plainValue`.

## Build Plan

1. Add the escape table and `unquote` to `src/parser.js`.
2. Branch on a leading `"` in `parse`, leaving the unquoted path unchanged.
