# reportkit operator guide

## Installation

reportkit has no dependencies beyond Python 3.10 or later. Copy the
`reportkit/` package into your project or add the repository root to
`PYTHONPATH`.

## Configuration

Build a configuration with `load_config(values)`, passing a dictionary read
from your settings file.

| Key | Default | Accepted values |
| --- | --- | --- |
| `retention_days` | `30` | Number of days exported files are kept |
| `output_format` | `csv` | `csv` |
| `output_dir` | `exports` | Directory for exports |

## Exporting

Call `export_rows(rows, config, name)` to write `rows`, a list of
dictionaries, to `<output_dir>/<name>.csv`.

## Related documents

- [README](../README.md)
- [Errata](ERRATA.md)
