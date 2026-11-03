# Using logtrim

logtrim reads a log file, or standard input, and prints the lines at or above
a chosen level.

## Command

```sh
logtrim [options] [file]
```

From a checkout, run `node src/cli.js` instead of `logtrim`.

## Options

| Option           | Default | Meaning                                                          |
| ---------------- | ------- | ---------------------------------------------------------------- |
| `--level <name>` | `warn`  | Lowest level to print: `debug`, `info`, `warn`, or `error`.      |
| `--grep <text>`  | none    | Only print lines whose message contains `text` (case-sensitive). |

## Log format

Each line must look like this:

```text
2026-03-01T10:00:00Z [info] Server started on port 8080
```

Lines in any other form are skipped.

## Example

```console
$ logtrim examples/sample.log
2026-03-01T10:00:04Z [warn] Disk usage at 85%
2026-03-01T10:00:07Z [error] Upload failed: timeout
```

## Errors

An unknown option prints `logtrim: unknown option: <option>` and exits with
status 2.
