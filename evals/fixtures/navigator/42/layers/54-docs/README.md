# timesheet-report

Summarises hours from a timesheet CSV export.

## Usage

    node src/cli.js report <file> <YYYY-MM-DD> [--by-project]

Prints the total hours logged in the week that contains the given date. A week
runs from Monday through Sunday.

The CSV needs a `date,project,hours` header; dates are `YYYY-MM-DD`.

## Per-project totals

Add `--by-project` to list the hours for each project under the weekly total,
largest first; projects with the same hours are listed by name. Each line is
rounded to two decimal places, so the lines may differ from the total by a
hundredth of an hour.

    $ node src/cli.js report hours.csv 2026-09-16 --by-project
    Week of 2026-09-14: 9.08 h
      beacon: 5.25 h
      atlas: 3.83 h

A week with no entries prints only the total line.

## Tests

    npm test
