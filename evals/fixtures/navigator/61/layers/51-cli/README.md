# timesheet

Totals for plain-text timesheets.

## Usage

```
node src/cli.js hours.txt
```

Each line is a date, a duration, and a description:

```
2026-09-20 1h30m sprint planning
2026-09-21 45m code review
```

Durations use hours, minutes, or both (`2h`, `45m`, `1h30m`). Blank lines are ignored.

Run the tests with `npm test`.
