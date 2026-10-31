<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: json-stock-summary-20260923T101500Z-5c2e9a17
-->

# Technical Design

## Context

The `inventory summary <file>` command (`inventory/cli.py`) loads items with
`load_items` (`inventory/store.py`), builds a summary dict with `build_summary`
(`inventory/report.py`), and prints `format_text(summary)`. The scope adds a JSON
rendering of the same summary behind a command-line option. The project uses the
standard library only (`.standards/CONTEXT.md`). No project references apply.

## Decision

Add a JSON formatter beside the existing text formatter in `inventory/report.py`,
and select between the two with an argparse `--format` option on the `summary`
subcommand. Keeping both formatters in the report module leaves the CLI
responsible only for argument handling and printing. argparse `choices` rejects
unsupported values, which already exits with status 2 and a usage message.

## Acceptance Coverage

- `AC-001`: `format_json` in `inventory/report.py` plus `--format json` on the
  `summary` subcommand.
- `AC-002`: `--format` defaults to `text`; the text path keeps calling
  `format_text` unchanged.
- `AC-003`: `--format` uses argparse `choices=["text", "json"]`; argparse reports
  the error and exits with status 2.

## Interfaces and Contracts

- `inventory.report.format_json(summary)`: returns
  `json.dumps(summary, indent=2)`. Keys keep the order `build_summary` produces
  (`total_items`, `total_units`, `low_stock`); `low_stock` is the list of SKUs in
  input order. No trailing newline; the CLI's `print` adds one.
- `summary` subcommand: `--format {text,json}`, default `text`. `json` prints
  `format_json(summary)`; `text` prints `format_text(summary)` exactly as today.
- `build_summary` and `format_text` are unchanged.

## Technical Acceptance Criteria

- `AC-001`: `json.loads` of the command's stdout with `--format json` equals
  `build_summary` of the same file.
- `AC-002`: Output with no `--format` and with `--format text` is identical to
  the current output.
- `AC-003`: `--format` with any value other than `text` or `json` exits with
  status 2 and prints argparse's usage error to stderr; nothing is printed to
  stdout.

## Build Plan

1. `inventory/report.py` (MODIFY): add `format_json`.
2. `inventory/cli.py` (MODIFY): add the `--format` option and dispatch to the
   matching formatter.

## Risks and Follow-up

- Consumers that parse the text output are unaffected because text remains the
  default.
