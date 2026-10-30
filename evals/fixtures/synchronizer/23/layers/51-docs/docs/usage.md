# export-records usage

    node bin/export-records.js [options]

Writes the bundled records that match the filters, ordered by id, to standard
output or to a file.

## Options

- `--status <active|archived>`: only records with this status.
- `--owner <name>`: only records owned by this user, for example `dana`.
- `--json`: write JSON instead of CSV.
- `--out <file>`: write to this file instead of standard output.
- `--help`: print the usage summary.

Filters combine: `--status active --owner dana` exports dana's active records.

## CSV output

CSV is the default. The first row is the header
`id,title,owner,status,createdAt`, followed by one row per record. Every row
ends with CRLF. A field that contains a comma, a double quote, or a line break
is enclosed in double quotes, and each double quote inside it is doubled
(RFC 4180).

## JSON output

`--json` writes the matching records as a JSON array of objects with `id`,
`title`, `owner`, `status`, and `createdAt`, indented by two spaces and
followed by a newline.

## Exit status

- `0`: the export was written.
- `2`: an unknown option or an unknown `--status` value. An error message is
  printed on standard error and nothing is written.
