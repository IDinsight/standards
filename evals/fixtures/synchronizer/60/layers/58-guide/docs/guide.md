# csvsum user guide

csvsum prints a one-line summary (count, minimum, maximum, and mean) for each
numeric column of a CSV file. It uses only the Python standard library.

## Running csvsum

From the repository root:

```text
python3 -m csvsum PATH [--column NAME] [--delimiter CHAR]
```

- `PATH` — the CSV file to read, as UTF-8. The first row must be a header row.
- `--column NAME` — summarize only this column. Repeat the option to summarize
  several columns; they are printed in the order given. Without it, every
  column in the header is summarized, in header order.
- `--delimiter CHAR` — the field separator, a single character; `,` by default.
  For semicolon-separated files use `--delimiter ';'`.

Examples using the sample file `examples/orders.csv`:

```text
$ python3 -m csvsum examples/orders.csv
order: count=4 min=1001 max=1004 mean=1002.50
customer: no numeric values
total: count=3 min=4.5 max=17 mean=11.17
items: count=3 min=1 max=3 mean=2.00

$ python3 -m csvsum examples/orders.csv --column total --column items
total: count=3 min=4.5 max=17 mean=11.17
items: count=3 min=1 max=3 mean=2.00
```

## Reading the output

Each summarized column prints one line:

```text
NAME: count=N min=MIN max=MAX mean=MEAN
```

- `count` is the number of cells in the column that parse as numbers.
- `min` and `max` use Python's general (`g`) number format: trailing zeros are
  dropped, so `17.00` prints as `17`, and values are shown to six significant
  digits.
- `mean` is rounded to two decimal places.

Cells that are blank or do not parse as a number (for example `n/a` or a name)
are skipped: they do not count toward `count`, `min`, `max`, or the mean. A
column with no numeric cells prints `NAME: no numeric values` instead.

## Errors

csvsum writes these errors to standard error and exits with status 2:

| Situation                              | Message                        |
| -------------------------------------- | ------------------------------ |
| The file does not exist                | `csvsum: no such file: PATH`   |
| A `--column` name is not in the header | `csvsum: unknown column: NAME` |

Missing or invalid arguments are reported by the argument parser together with
a usage line, also with exit status 2. On success csvsum exits with status 0.
