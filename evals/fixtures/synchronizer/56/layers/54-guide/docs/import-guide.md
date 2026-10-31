# Importing bank exports

`ledger import` reads a CSV file exported from a bank and turns each row into a
JSON transaction. This guide covers running the command, preparing the input
file, reading the output, and handling errors.

## Running an import

From the project folder:

```sh
node bin/ledger.js import <file.csv> [--out <file.json>] [--dry-run]
```

The package also declares a `ledger` command in `package.json`; where that
command is installed on your `PATH`, `ledger import ...` takes the same
arguments.

- `<file.csv>`: the CSV file to read. Required.
- `--out <file.json>`: write the transactions to this file instead of printing
  them. An existing file at that path is replaced.
- `--dry-run`: read and check the file and print the summary line, but do not
  print or write any transactions.

Options may come before or after the file name.

## Preparing the CSV file

The first non-blank line is the header row. Column names are matched without
regard to letter case or surrounding spaces, and columns may appear in any
order:

| Column        | Required | Accepted values                                        |
| ------------- | -------- | ------------------------------------------------------ |
| `date`        | Yes      | `YYYY-MM-DD`, for example `2026-09-01`                 |
| `description` | Yes      | Any text without commas                                |
| `amount`      | Yes      | A number such as `1500.00` or `-82.40`                 |
| `category`    | No       | Any text without commas; empty becomes `uncategorized` |

Other columns are read but not included in the output.

Things to know about the input:

- Every comma starts a new column. Quoted values are not supported, so no value
  can contain a comma.
- Spaces around each value are removed, and blank lines are skipped.
- The date is checked for the `YYYY-MM-DD` shape only, not against the
  calendar.
- Use a negative amount for money going out. Amounts are converted to whole
  cents, rounded to the nearest cent. An empty amount is read as `0`.

## Output

A successful import first prints a summary line with the number of transactions
and their net total:

```text
3 transactions, net 1372.60
```

Without `--out`, the transactions follow on standard output as a JSON array.
With `--out`, the summary line is still printed and the array goes to the file.
Each transaction has these fields:

```json
{
  "date": "2026-09-05",
  "description": "Bus pass",
  "amountCents": -4500,
  "category": "uncategorized"
}
```

`amountCents` is the amount in cents, as an integer.

## Exit codes and errors

| Exit code | Meaning                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `0`       | The import succeeded, including a dry run.                                         |
| `1`       | The file could not be read or a row is invalid. No transactions are output.        |
| `2`       | The command was used incorrectly: no file, an extra argument, or another command.  |

A failed import prints one line to standard error starting with
`import failed:`, for example:

```text
import failed: missing column: amount
import failed: line 3: invalid date "09/03/2026"
import failed: line 2: invalid amount "abc"
import failed: ENOENT: no such file or directory, open 'missing.csv'
```

Line numbers count the header row as line 1 and skip blank lines.

A usage problem prints
`usage: ledger import <file.csv> [--out <file.json>] [--dry-run]`, or
`unexpected argument: <argument>` for an extra argument.

## Example

The repository includes a sample export at `test/fixtures/sample.csv`:

```text
Date,Description,Amount,Category
2026-09-01,Paycheck,1500.00,income
2026-09-03,Grocery Mart,-82.40,food
2026-09-05,Bus pass,-45.00,
```

Check it without producing any transactions:

```sh
node bin/ledger.js import test/fixtures/sample.csv --dry-run
```

```text
3 transactions, net 1372.60
```

Write the transactions to a file:

```sh
node bin/ledger.js import test/fixtures/sample.csv --out september.json
```

The third row has no category, so it is saved as `uncategorized`.
