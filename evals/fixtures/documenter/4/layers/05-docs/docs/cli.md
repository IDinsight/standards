# Command reference

Run recordbook from the directory that holds `data/`:

    python3 -m recordbook [--data PATH] <command> [options]

## Global options

| Option        | Meaning                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| `--data PATH` | Records file to read. Defaults to `$RECORDBOOK_DATA` when set, otherwise `data/records.json`. |

## list

Print the records that match every given filter, ordered by id.

    python3 -m recordbook list [--status {active,archived}] [--owner USER] [-q TEXT] [--json]

| Option          | Meaning                                              |
| --------------- | ---------------------------------------------------- |
| `--status`      | `active` or `archived`                               |
| `--owner`       | exact owner username, for example `marco`            |
| `-q`, `--query` | case-insensitive text that must appear in the title |
| `--json`        | print a JSON array instead of the table              |

The table has one line per record: id, status, owner, and title. With
`--json`, each record is an object with `id`, `title`, `owner`, `status`, and
`created_at` (ISO 8601, UTC).

Example:

    $ python3 -m recordbook list --status active --owner marco
       4  active    marco     Insurance renewal 2026
       6  active    marco     Office move inventory

## Exit status

| Code | Meaning                                                                    |
| ---- | -------------------------------------------------------------------------- |
| 0    | Success                                                                    |
| 1    | The records file does not exist (`recordbook: data file not found: PATH`) |
| 2    | Invalid command or option, for example an unknown `--status` value         |
