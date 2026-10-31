# Timesheet totals guide

## Who this guide is for

This guide is for team leads and payroll staff who run the `hours` command on a
timesheet CSV export to see how many hours each person logged. It assumes you
have Node.js 22 or later and run commands from the root of this repository.

This guide does not cover:

- How to produce the CSV export. That comes from the time-tracking system.
- Pay rates, overtime, or rounding rules for payroll. `hours` only adds up the
  hours in the file.
- Changing or testing the code. Contributors should read
  [CONTRIBUTING.md](../CONTRIBUTING.md).

## Preparing the input file

The file must be a CSV file whose first non-blank line is a header row. The
header must include columns named `name` and `hours` (lowercase). Other
columns, such as `date`, are ignored, and the columns can be in any order.

```csv
date,name,hours
2026-09-21,Ana,7.5
2026-09-21,Ben,8
```

- Every row needs a name and a numeric `hours` value. Decimals use a dot
  (`7.5`).
- Spaces around values are ignored, and blank lines are skipped.
- Values are split at every comma. Quoted values that contain commas are not
  supported.
- Names are matched exactly, including case: `Ana` and `ana` are counted as
  two people.
- Windows (CRLF) line endings are accepted.

The repository includes a sample file, `examples/week.csv`, used in the
examples below.

## Showing totals per person

```console
$ node bin/hours.js examples/week.csv
Ana: 13.50
Ben: 12.25
```

Each line shows a person and their total hours with two decimal places. People
are listed in alphabetical order by name.

## Getting JSON output

Add `--json` before or after the file name to get the totals as a JSON array,
for example to load them into a spreadsheet script:

```console
$ node bin/hours.js --json examples/week.csv
[{"name":"Ana","hours":13.5},{"name":"Ben","hours":12.25}]
```

The JSON values are not rounded to two decimal places.

An empty file, or a file with only a header row, prints an empty line, or `[]`
with `--json`.

## When something goes wrong

`hours` reads exactly one file. Any argument other than `--json` is treated as
a file name. Error messages are printed on standard error.

- If you give no file or more than one file, it prints
  `Usage: hours [--json] <timesheet.csv>` and exits with status 2.
- If the file cannot be read, the header lacks a `name` or `hours` column, or a
  row has an empty name or a missing or non-numeric hours value, it prints
  `hours: ` followed by the reason and exits with status 1. No totals are
  printed. For a bad row, the reason gives the line number in the file, for
  example `hours: Line 3: hours is not a number`.

A successful run exits with status 0.
