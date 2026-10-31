# Converting CSV files to JSON

`rowtool convert` reads a CSV file and turns each data row into a JSON object.

## Usage

```sh
rowtool convert <file.csv> [--delimiter <char>] [--out <file.json>]
```

- `<file.csv>`: the CSV file to read. Its first line must be the header row.
- `--delimiter <char>`: the field separator. Defaults to `,`. For example,
  `--delimiter ';'` reads semicolon-separated files.
- `--out <file.json>`: write the JSON to this file.

Each option takes its value as the next argument.

## Output

By default, `convert` prints the JSON to standard output, so you can redirect it
or pipe it to another tool:

```sh
rowtool convert ledger.csv > ledger.json
```

Pass `--out <file.json>` to write the JSON to that file instead. Nothing is
printed, and an existing file is overwritten.

The JSON is an array with one object per data row, indented with two spaces.

## How rows become objects

- Each header name becomes a key, and each later line becomes one object.
- Spaces around each field are removed.
- Every value is a string, including numbers and dates.
- If a row has fewer fields than the header, the missing keys get `""`.
- If a row has more fields than the header, the extra fields are dropped.
- Fields are split on the delimiter exactly. Quoted fields are not supported, so
  a delimiter inside quotes still splits the field.

For example, this input:

```csv
date,payee,amount
2026-01-02,Corner Bakery,12.50
2026-01-03,City Transit
```

produces:

```json
[
  {
    "date": "2026-01-02",
    "payee": "Corner Bakery",
    "amount": "12.50"
  },
  {
    "date": "2026-01-03",
    "payee": "City Transit",
    "amount": ""
  }
]
```

## Errors

If an option is not recognized or is missing its value, `rowtool` prints the
problem and the usage text to standard error and exits with status 2. It does
the same when the file argument is missing.
