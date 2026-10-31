# Importing bank statements with ledger-import

This guide is for anyone who turns a bank statement export into a ledger
summary. It covers running the importer from a checkout of this repository.

## Before you start

- Node.js 22 or later.
- Run the commands below from the repository root.
- Save the statement as a CSV file with three columns in this order: date,
  description, amount.
  - Write amounts as decimal numbers, with a leading minus sign for money going
    out (for example `-4.50`).
  - Quoted fields are not supported, so a description must not contain the
    column separator.
- The first non-empty line is treated as a header row and skipped. Blank lines
  are ignored.

## Running an import

```sh
node bin/import.js path/to/statement.csv
```

For a file containing:

```text
date,description,amount
2026-09-01,Coffee,-4.50
2026-09-02,Refund,17.00
```

the command prints:

```json
{"currency":"USD","count":2,"totalCents":1250}
```

## Options

Options can go before or after the file name.

| Option               | Default                            | Effect                                                                               |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| `--delimiter <char>` | `,`                                | Column separator, for example `--delimiter ';'`. It must be exactly one character.   |
| `--currency <code>`  | `LEDGER_CURRENCY`, otherwise `USD` | Currency code written in the summary. It is a label only; amounts are not converted. |
| `--no-header`        | header row skipped                 | Treat the first line as data instead of a header.                                    |

Set the `LEDGER_CURRENCY` environment variable to change the default currency,
for example `LEDGER_CURRENCY=EUR node bin/import.js statement.csv`. A
`--currency` option overrides it.

## Output

On success the command prints one line of JSON to standard output and exits
with status 0:

- `currency`: the currency code from `--currency` or `LEDGER_CURRENCY`.
- `count`: the number of data rows read (the header row is not counted).
- `totalCents`: the sum of all amounts, in whole cents. Each amount is rounded
  to the nearest cent before it is added.

## Errors

On failure the command prints a message beginning with `ledger-import:` to
standard error and exits with status 1. Messages you may see:

- `missing input file`: no file name was given.
- `unknown option --<name>`: the option is not one of those listed above.
- `delimiter must be one character`: the `--delimiter` value is empty or longer
  than one character.
- `line N: invalid amount "<value>"`: the amount column of a row cannot be read
  as a number. Lines are counted from the first non-empty line of the file,
  including the header; blank lines are not counted.
- A file system error such as `ENOENT: no such file or directory`: the input
  file could not be read.
