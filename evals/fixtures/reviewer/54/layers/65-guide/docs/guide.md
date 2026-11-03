# Summarize command guide

`bin/summarize.js` reads a CSV file and prints summary statistics (count, sum,
smallest, largest, and average) for one numeric column. Use it to get quick
totals from a ledger export without opening a spreadsheet.

## Before you start

You need Node.js. The command uses only Node's built-in modules, so there is
nothing to install. The examples in this guide are run from the repository
root; file paths you pass are read relative to your current directory.

## Running the command

```sh
node bin/summarize.js <file.csv> --column <name> [--format <format>]
```

| Argument            | Required | Meaning                                                                                                                                  |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `<file.csv>`        | Yes      | The CSV file to read.                                                                                                                    |
| `--column <name>`   | Yes      | The header of the column to summarize. It must match a header cell exactly, including upper and lower case. Spaces around header cells are ignored. |
| `--format <format>` | No       | `text` (the default) or `json`.                                                                                                          |

Arguments may be given in any order. A missing file or `--column`, a
`--format` value other than `text` or `json`, or a second file path is a usage
error (see [Exit codes and errors](#exit-codes-and-errors)).

## Input format

The CSV reader is deliberately simple:

- The first non-blank line is the header row; every later non-blank line is a
  data row.
- Cells are separated by commas, and spaces around each cell are ignored.
- Quoted fields are not supported. A comma inside quotes still splits the cell,
  so a value such as `"1,200"` is read as two cells and the row's later columns
  shift.
- Blank lines anywhere in the file are ignored.
- If a row has fewer cells than the header, the missing cells are treated as
  empty. Extra cells beyond the header are ignored.

## What gets counted

A cell counts as a value when it reads as a finite number, for example `12`,
`-3.5`, `0.25`, or `1e3`. Empty cells and cells that are not numbers, such as
`n/a` or `twelve`, are skipped. Skipped rows are not an error; they are counted
in the `skipped` field so you can see how many rows did not contribute.

## Reading the output

| Field     | Meaning                                                                          |
| --------- | -------------------------------------------------------------------------------- |
| `count`   | Number of rows whose cell was a number.                                          |
| `skipped` | Number of rows whose cell was empty or not a number.                             |
| `sum`     | Total of the numbers, rounded to two decimal places.                             |
| `min`     | Smallest number, not rounded.                                                    |
| `max`     | Largest number, not rounded.                                                     |
| `mean`    | Average of the numbers (total divided by `count`), rounded to two decimal places. |

With the default text format the command prints one `field: value` line per
field, in the order above. With `--format json` it prints the same fields as a
single-line JSON object.

If the column has no numeric cells at all, `count` and `sum` are `0`, and
`min`, `max`, and `mean` have no value: the text format shows `-` and JSON
shows `null`.

Numbers are printed without trailing zeros, so `120.50` in the file appears as
`120.5`.

## Examples

All examples use the sample file `examples/sales.csv`:

```csv
region,amount,units
north,120.50,3
south,80,2
east,,1
west,99.5,4
```

Summarize the `amount` column. The `east` row has no amount, so it is skipped:

```console
$ node bin/summarize.js examples/sales.csv --column amount
count: 3
skipped: 1
sum: 300
min: 80
max: 120.5
mean: 100
```

Get the `units` column as JSON:

```console
$ node bin/summarize.js examples/sales.csv --column units --format json
{"count":4,"skipped":0,"sum":10,"min":1,"max":4,"mean":2.5}
```

A column with no numbers, such as `region`, reports every row as skipped:

```console
$ node bin/summarize.js examples/sales.csv --column region
count: 0
skipped: 4
sum: 0
min: -
max: -
mean: -
```

## Exit codes and errors

| Exit code | When                                                                                                    | Message on standard error                                   |
| --------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `0`       | The summary was printed.                                                                                | None                                                        |
| `1`       | Usage error: the file or `--column` is missing, `--format` is not `text` or `json`, or there is an extra argument. | The usage line shown below.                                 |
| `1`       | The file could not be read, for example because it does not exist.                                      | Node's error details, such as `ENOENT: no such file or directory`. |
| `2`       | The `--column` name is not in the header row.                                                           | `Column not found: <name>`                                  |

The usage line is:

```text
Usage: summarize <file.csv> --column <name> [--format text|json]
```

Because exit code `1` covers both usage errors and unreadable files, check the
message to tell them apart.
