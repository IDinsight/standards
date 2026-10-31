# reportkit operator guide

This guide is for operators who configure reportkit, export report rows, and
clean up old exports from their own scripts.

## Installation

reportkit needs Python 3.10 or later and has no other dependencies. Add the
repository root to `PYTHONPATH`, or copy the `reportkit/` package into your
project.

## Configuration

Build a configuration with `load_config(values)`, passing a dictionary read
from your settings file. Keys you leave out take their defaults.

| Key | Default | Accepted values |
| --- | --- | --- |
| `retention_days` | `30` | Whole number of days, at least 1 |
| `output_format` | `csv` | `csv` or `jsonl` |
| `output_dir` | `exports` | Any directory path; created on first export |

`load_config` raises `ValueError` when `retention_days` is below 1 or
`output_format` is not one of the accepted values.

## Exporting

`format_rows(rows, output_format)` returns the export text for a list of
dictionaries. CSV output has a header row taken from the first row's keys,
quotes fields that need it, and ends every line with a newline:

```pycon
>>> from reportkit.export import format_rows
>>> print(format_rows([{"id": 1, "name": "a,b"}], "csv"), end="")
id,name
1,"a,b"

```

JSON Lines output writes one object per line with its keys sorted:

```pycon
>>> print(format_rows([{"name": "x", "id": 1}], "jsonl"), end="")
{"id": 1, "name": "x"}

```

An empty list gives an empty CSV export, without a header.

`export_rows(rows, config, name)` writes the same text to
`<output_dir>/<name>.<output_format>`, creating `output_dir` if needed, and
returns the path it wrote.

## Pruning

`prune(directory, retention_days)` deletes the regular files in `directory`
whose last modification time is before the cutoff and returns their names in
sorted order. Subdirectories and newer files are left in place. The cutoff is
the current time minus `retention_days * 86400` seconds; `cutoff_for` exposes
the same calculation:

```pycon
>>> from reportkit.prune import cutoff_for
>>> cutoff_for(1_000_000, 1)
913600

```

To prune with the configured retention, pass `config.retention_days`.

## Related documents

- [README](../README.md)
- [Writing reportkit documentation](CONTRIBUTING.md)
- [Errata](ERRATA.md)
