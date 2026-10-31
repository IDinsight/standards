<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: interval-durations-20260924T090000Z-3e8a51c7
-->

# Technical Design

## Context

Intervals are interpreted only in `src/config.js`, which today accepts positive
integers (seconds). The scheduler consumes `intervalSeconds` and is unaffected.

## Decision

- Add `src/duration.js` exporting `parseDuration(text)`, which returns seconds
  or `null`. Grammar: one or more contiguous `<digits><unit>` parts, where the
  unit is `h`, `m`, or `s` (case-insensitive) and every part has a unit;
  surrounding whitespace is ignored; the total must be greater than zero.
- `src/config.js` keeps the integer path. A string interval goes through
  `parseDuration`; any other value, or a `null` result, throws
  `config: <job name>: invalid interval <JSON of the value>`.

## Acceptance Coverage

- `AC-001`: `parseDuration` grammar and the string path in `src/config.js`.
- `AC-002`: integer path in `src/config.js`, unchanged.
- `AC-003`: error contract in `src/config.js` for values that are neither a
  positive integer nor a valid duration.

## Interfaces and Contracts

- `parseDuration(text: string): number | null`.
- Parsed job shape stays `{ name, command, intervalSeconds }`.

## Technical Acceptance Criteria

- `AC-001`: every part carries a unit; parts are contiguous; the result is the
  sum of the parts in seconds.
- `AC-003`: the thrown message starts with `config: <job name>: invalid
  interval` followed by the JSON form of the rejected value.

## Build Plan

1. `src/duration.js` (CREATE): the parser.
2. `src/config.js` (MODIFY): route string intervals through the parser and keep
   the integer path.
