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
`--sep` (default `,`):

```console
$ csvsum docs/examples/costs.csv --column cost --sep ';'
count 3
sum 28.00
mean 9.33
```
