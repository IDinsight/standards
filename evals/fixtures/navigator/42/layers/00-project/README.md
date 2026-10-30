# timesheet-report

Summarises hours from a timesheet CSV export.

## Usage

    node src/cli.js report <file> <YYYY-MM-DD>

Prints the total hours logged in the week that contains the given date. Weeks
start on Monday.

The CSV needs a `date,project,hours` header; dates are `YYYY-MM-DD`.

## Tests

    npm test
