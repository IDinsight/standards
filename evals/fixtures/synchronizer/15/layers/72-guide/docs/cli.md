# records-export command line

`records-export` converts a JSON file holding an array of records into CSV.

## Running it

From a checkout, run the command with Node 22:

    node bin/records-export.js <input.json> [options]

After `npm install -g .` the same command is available as `records-export`.
The examples below use that name and the sample file `examples/records.json`,
and run from the repository root.

## Synopsis

    records-export <input.json> [--columns <list>] [--output <file>] [--delimiter <char>]

The input file is the one positional argument. Options may come before or
after it.

## Options

- `-c`, `--columns <list>`: comma-separated column names to export, in that
  order. Without it, the columns are the keys of the first record.
- `-o`, `--output <file>`: write the CSV to `<file>` instead of standard
  output. The command then prints `records-export: wrote <n> records to <file>`
  on standard error.
- `--delimiter <char>`: field delimiter, exactly one character. Default `,`.
- `-h`, `--help`: print the usage and exit.
- `-v`, `--version`: print the version and exit.

## Output

The first row is the header with the column names, followed by one row per
record. Every row, including the last, ends with CRLF. A field containing the
delimiter, a double quote, or a line break is enclosed in double quotes, and
each double quote inside it is doubled (RFC 4180). A missing field is written
empty.

## Examples

Export every record to standard output:

    records-export examples/records.json

    id,title,owner,status
    1,"Lease agreement, Building B",dana,active
    2,Vendor onboarding checklist,li,active
    3,"Q2 ""priority"" accounts review",dana,archived

Export only the `id` and `title` columns:

    records-export examples/records.json --columns id,title

    id,title
    1,"Lease agreement, Building B"
    2,Vendor onboarding checklist
    3,"Q2 ""priority"" accounts review"

Write the CSV to a file:

    records-export examples/records.json --output records.csv

This writes the same CSV as the first example to `records.csv` and prints
`records-export: wrote 3 records to records.csv`.

Use a semicolon as the delimiter, for spreadsheet programs that expect one:

    records-export examples/records.json --delimiter ';'

    id;title;owner;status
    1;Lease agreement, Building B;dana;active
    2;Vendor onboarding checklist;li;active
    3;"Q2 ""priority"" accounts review";dana;archived

With `;` as the delimiter, the comma in the first title no longer needs
quotes.

## Exit status

- `0`: success, including `--help` and `--version`.
- `1`: the input file cannot be read, is not valid JSON, or does not hold an
  array.
- `2`: usage error: an unknown option, an extra argument, a missing input
  file argument, an option without its value, or a delimiter that is not one
  character. The command prints the problem and the usage on standard error.
