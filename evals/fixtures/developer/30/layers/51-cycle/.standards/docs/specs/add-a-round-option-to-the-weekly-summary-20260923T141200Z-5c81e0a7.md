<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-round-option-to-the-weekly-summary-20260923T141200Z-5c81e0a7
-->

# Technical Design

## Context

`tally/summary.py` sums minutes per project for one week and `tally/cli.py`
prints the result as JSON. Totals are exact today. The summary JSON shape is
consumed by downstream scripts and must not change.

## Decision

Add a pure rounding helper in a new module `tally/durations.py`. Give
`weekly_summary` an optional keyword argument `round_to` (default `None`) that
rounds each project's total after summing. Add a `--round` option to the CLI
whose argparse `type` accepts only positive integers, so invalid values fail in
argument parsing before any file is read.

## Acceptance Coverage

- `AC-001`: `round_minutes` applied to each per-project total in
  `weekly_summary` when `round_to` is set; the CLI passes `--round N` through as
  `round_to=N`.
- `AC-002`: `round_to=None` leaves `weekly_summary` output unchanged; the CLI
  passes `None` when `--round` is absent.
- `AC-003`: argparse `type=` validator raising `argparse.ArgumentTypeError` for
  non-positive or non-integer values; argparse reports a usage error and exits
  with status 2 before a summary is built.

## Interfaces and Contracts

- `tally.durations.round_minutes(minutes: int, step: int) -> int`: the nearest
  multiple of `step`; when `minutes` is exactly halfway between two multiples,
  the larger one. Raises `ValueError` when `step` is not a positive integer.
- `tally.summary.weekly_summary(entries, week_of, round_to=None)`: same return
  shape as today; with `round_to` set, each `minutes` value is
  `round_minutes(total, round_to)`.
- CLI: `--round N` (optional). Absent means no rounding.

## Technical Acceptance Criteria

- `AC-001`: Rounding is applied once per project total, after summing, never to
  individual entries.
- `AC-002`: With `round_to=None`, `weekly_summary` returns exactly what it
  returns today for the same inputs.
- `AC-003`: Invalid `--round` values are rejected during argument parsing; the
  CSV is not read and nothing is printed to stdout.

## Build Plan

1. Rounding helper in `tally/durations.py`.
2. Optional `round_to` in `weekly_summary`.
3. `--round` option and validator in `tally/cli.py`.

## Alternatives

- Rounding inside the CLI after the summary is built: rejected so library
  callers of `weekly_summary` get the same behavior.
