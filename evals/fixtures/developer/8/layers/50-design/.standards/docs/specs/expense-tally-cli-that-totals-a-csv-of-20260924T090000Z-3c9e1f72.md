<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72
-->

# Technical Design

## Context

New Python project with no existing code. The scope asks for a command-line
tool that reads a UTF-8 CSV of expenses (`date`, `category`, `amount`) and
prints per-category totals, using only the standard library.

## Decision

A small `tally` package with three modules: parsing, reporting, and a
`__main__` entry point run as `python3 -m tally <file>`. Amounts are parsed
with `decimal.Decimal` so totals carry no binary floating-point error. Parsing
and reporting are pure functions over text streams and lists, so the entry
point stays thin.

## Acceptance Coverage

- `AC-001`: `tally.ledger.read_entries` returns an `Entry` for every row whose
  amount parses as a `Decimal`.
- `AC-002`: `read_entries` collects the CSV line numbers of rows whose amount
  does not parse; `tally/__main__.py` reports each one on standard error.
- `AC-003`: `tally.report.totals` and `tally.report.format_report` produce the
  sorted, two-decimal report.
- `AC-004`, `AC-005`: `tally/__main__.py` handles the argument, file opening,
  output streams, and exit status.

## Components

- `tally/__init__.py` — empty package marker.
- `tally/ledger.py` — CSV parsing into entries; no printing.
- `tally/report.py` — aggregation and formatting; no I/O.
- `tally/__main__.py` — argument parsing, file access, stdout/stderr, exit codes.

## Interfaces and Contracts

- `Entry`: frozen dataclass with `date: str`, `category: str` (surrounding
  whitespace removed), and `amount: Decimal`.
- `read_entries(stream) -> tuple[list[Entry], list[int]]`: reads with
  `csv.DictReader`; returns entries in file order and the line numbers
  (`reader.line_num`) of skipped rows. A missing or non-numeric amount,
  including `NaN` and infinities, skips the row.
- `totals(entries) -> dict[str, Decimal]`: sum of amounts per category.
- `format_report(totals) -> str`: one line `<category>: <total>` per category,
  sorted by category name, totals quantized to `0.01` with `ROUND_HALF_UP`,
  each line ending with a newline.
- Command `python3 -m tally <file>`: opens the file with `encoding="utf-8"` and
  `newline=""`. Each skipped row is reported on stderr as
  `tally: skipped line <n>: invalid amount`. A missing file prints
  `tally: cannot open <file>` on stderr and exits 2. Success prints the report
  on stdout and exits 0.

## Technical Acceptance Criteria

- `AC-001`: Entries keep file order and hold the exact decimal amount from the
  file.
- `AC-002`: Line numbers count the header as line 1; skipping a row never stops
  later rows from being read.
- `AC-003`: Categories are compared as exact strings after stripping
  whitespace; ordering is Python string ordering.
- `AC-004`: On success only the report is written to stdout.
- `AC-005`: On a missing file nothing is written to stdout.

## Build Plan

1. Parsing module and `Entry`.
2. Aggregation and formatting.
3. Command-line entry point wiring the two together.

## Risks and Follow-up

- A UTF-8 byte order mark would rename the first header column; the first
  column is `date`, which the report does not use, so this is not handled in
  this cycle.
