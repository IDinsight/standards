# ledgerline User Guide

`ledgerline` reads a bank statement exported as CSV and prints the income,
spending, and net total for one month. It runs with Node.js 22 and has no
dependencies.

## Statement files

A statement is a UTF-8 CSV file. Its first line must be the header:

```text
date,description,amount
```

The header is matched without regard to case or to spaces around each name.
Every following line is one entry:

- `date`: the entry date as `YYYY-MM-DD`.
- `description`: free text. It must not contain a comma, because fields are
  split on every comma and quoted fields are not supported.
- `amount`: a decimal number. Income is positive and spending is negative.

Blank lines are skipped. `examples/statement.csv` is a complete example.

## Checking a statement: `import`

```sh
node bin/ledgerline.js import examples/statement.csv
```

prints:

```text
Read 5 entries from examples/statement.csv
```

`import` reads and checks the whole file and reports how many entries it found.
It does not save or copy anything. If the header is wrong or an entry cannot be
read, it prints the problem and exits with code 3.

## Monthly summary: `summary`

```sh
node bin/ledgerline.js summary examples/statement.csv --month 2026-08
```

prints:

```text
2026-08: 4 entries
  income   2415.20
  spending 1032.45
  net      1382.75
```

`--month YYYY-MM` is required and selects the entries dated in that month.
Income is the sum of amounts of zero or more, spending is the sum of negative
amounts shown as a positive number, and net is income minus spending. All three
are shown with two decimals. A month with no entries prints zero totals.

## Exit codes

| Code | Meaning                                                                                             |
| ---- | --------------------------------------------------------------------------------------------------- |
| 0    | The command succeeded.                                                                              |
| 1    | Usage error: unknown command or no file given (the usage line is printed), or `summary` without a `--month` value. |
| 2    | The `--month` value is not a valid month (`YYYY-MM` with a month from 01 to 12).                    |
| 3    | The file cannot be read, its header is not `date,description,amount`, or an entry cannot be read.   |
