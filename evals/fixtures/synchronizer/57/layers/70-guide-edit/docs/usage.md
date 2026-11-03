# Using tally

`tally` reads an expense CSV file and prints totals. Run the commands below
from the repository root with Python 3.

## Input file

The file needs a header row with `date`, `category`, and `amount` columns.
Dates use the `YYYY-MM-DD` form and amounts are decimal numbers such as
`12.50`. Other columns are ignored. `data/expenses.csv` is a small example.

## Totals by category

```
python3 -m tally summary data/expenses.csv
```

prints one tab-separated line per category, sorted by name:

```
dining	27.60
groceries	154.05
transport	24.00
utilities	194.55
```

## Totals by month

Add `--by month` to group the rows by the month of their date:

```
python3 -m tally summary --by month data/expenses.csv
```

```
2026-08	201.35
2026-09	198.85
```

## Checking a file

To confirm that a file can be read before summarizing it, run:

```
python3 -m tally check --strict data/expenses.csv
```

It prints `ok: 8 rows` for the example file. `--strict` also rejects rows whose
category is blank and lists their line numbers.

## Exit status

- `0`: the command succeeded.
- `1`: `check --strict` found rows with a blank category.
- `2`: the file could not be read, a required column is missing, or an amount
  is not a number. The reason is printed to standard error after `error:`.
