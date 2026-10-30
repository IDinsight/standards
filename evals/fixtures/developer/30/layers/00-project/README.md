# tally

Summarize time-tracking entries from a CSV file into a weekly report.

```
python3 -m tally.cli examples/week.csv --week 2026-09-24
```

The CSV needs `date` (ISO 8601), `project`, and `minutes` columns. `--week`
accepts any date in the week to report (weeks start on Monday) and defaults to
today. Output is JSON with the Monday of the week and each project's total
minutes, sorted by project name.

## Development

Python 3.11+, standard library only. Run the tests with:

```
python3 -m pytest -q
```
