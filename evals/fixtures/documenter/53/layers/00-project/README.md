# logpack

Convert plain-text application logs to JSON Lines.

Each input line has the form `<ISO-8601 time> <LEVEL> <message>`, where
`LEVEL` is one of `DEBUG`, `INFO`, `WARN`, or `ERROR`. Lines that do not match
are skipped.

## Usage

```sh
logpack [--level LEVEL] <file>
```

- `--level LEVEL`: lowest level to keep (`debug`, `info`, `warn`, `error`).
  Defaults to `info`.

Each kept line is written to standard output as a JSON object with `time`,
`level`, and `message`.

## Development

```sh
npm test
```
