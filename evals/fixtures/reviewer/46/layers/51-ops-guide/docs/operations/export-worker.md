# Nightly export

The nightly export turns the day's records into one CSV file in the archive
directory. Cron runs it at 01:00 UTC on the batch host.

## Configuration

| Variable      | Default         | Meaning                              |
| ------------- | --------------- | ------------------------------------ |
| `ARCHIVE_DIR` | `./var/archive` | Directory that receives export files |

## Running by hand

```sh
node bin/export.js < records.json
```

`records.json` is a JSON array of flat objects; the first object's keys become
the header row. The command prints `wrote N rows to <file>`. The file is named
`export-YYYY-MM-DD.csv` after the current UTC date, so a second run on the same
day replaces that day's file.

## Troubleshooting

- `Unexpected token` errors mean the input is not valid JSON.
- An empty array writes an empty file.
