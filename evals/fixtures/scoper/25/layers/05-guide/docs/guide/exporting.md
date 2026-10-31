# Exporting records to CSV

This guide is for analysts who receive survey records as a JSON file and need
them as CSV for a spreadsheet or statistics package.

## Before you start

- Node.js 22 or later.
- Run the commands from the repository root. There is nothing to install.
- The input must be a JSON file containing an array of record objects, such as
  `data/sample-records.json`.

## Export to the terminal

```sh
node bin/export.js --input data/sample-records.json
```

The CSV is printed to standard output. The header row lists every field name in
the order the names first appear in the input, and each record follows on its
own line. Lines end with a single newline (LF), including the last one.

## Save to a file

```sh
node bin/export.js --input data/sample-records.json --output visits.csv
```

The file is created or overwritten, and the command prints a confirmation:

```text
Wrote 3 records to visits.csv
```

## Options

| Option               | Required | Default         | Effect                                                |
| -------------------- | -------- | --------------- | ----------------------------------------------------- |
| `--input <path>`     | Yes      | none            | JSON file with an array of records.                   |
| `--output <path>`    | No       | Standard output | File to write the CSV to.                             |
| `--fields <names>`   | No       | Every field     | Comma-separated field names to export, in this order. |
| `--delimiter <char>` | No       | `,`             | Single character placed between values.               |

Each option takes its value from the next argument: write `--fields id,name`,
not `--fields=id,name`.

## Choose columns

```sh
node bin/export.js --input data/sample-records.json --fields id,name
```

```text
id,name
1,Kibera clinic
2,"Lakeside, North"
3,"Hill ""B"" post"
```

Spaces around names and empty entries are ignored, so `--fields "id, name,"` is
the same as `--fields id,name`. A name that does not appear in any record is an
error.

## How values are written

- A value containing the delimiter, a double quote, or a line break is wrapped
  in double quotes, and each double quote inside it is doubled.
- A field missing from a record, or set to `null`, is written as an empty value.
- Numbers and booleans are written in their plain text form (`42`, `true`).

## Empty input

If the input is an empty array, the output is empty unless `--fields` is given,
in which case only the header row is written. With `--output`, the file is still
created and the confirmation reports 0 records.

## Errors

On a problem the command prints a message starting with `error:` to standard
error and exits with a non-zero status.

| Message                                              | Exit status | Cause                                                                                            |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `error: --input is required`                         | 2           | `--input` was not given.                                                                         |
| `error: <option> needs a value`                      | 2           | An option was the last argument, with no value after it.                                         |
| `error: unknown option <argument>`                   | 2           | An argument is not one of the options above.                                                     |
| `error: --delimiter must be a single character`      | 2           | The `--delimiter` value is empty or longer than one character.                                   |
| `error: unknown field <name>`                        | 2           | A name in `--fields` does not appear in any record. Not reported when the input array is empty. |
| `error: cannot read <path>`                          | 1           | The input file does not exist, cannot be read, or is not valid JSON.                             |
| `error: <path> must contain a JSON array of records` | 1           | The input is valid JSON but not an array.                                                        |
| `error: cannot write <path>`                         | 1           | The output file cannot be created, for example because its folder does not exist.               |
