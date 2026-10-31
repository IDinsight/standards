# csvsum usage

`csvsum` adds up one numeric column of a CSV file and prints the row count,
sum, and mean.

## Basic use

```console
$ csvsum docs/examples/sales.csv --column amount
count 4
sum 120.00
mean 30.00
```

`--column` (short form `-c`) is required and names a column in the header
line. Sums and means are printed with two decimal places.

## Other delimiters

For files separated by something other than a comma, pass the separator with
`--delimiter` (default `,`):

```console
$ csvsum docs/examples/costs.csv --column cost --delimiter ';'
count 3
sum 28.00
mean 9.33
```

## JSON output

`--format json` prints the same summary as one JSON object instead of the
default `text` lines:

```console
$ csvsum docs/examples/sales.csv -c amount --format json
{"count":4,"sum":120,"mean":30}
```

## Empty cells and errors

Empty cells in the column are skipped and do not count toward `count`. If any
other value in the column is not a number, csvsum prints
`csvsum: column <name> has non-numeric values` and exits with status 1. If the
header has no column with the given name, it prints
`csvsum: no column named <name>` and exits with status 1.
