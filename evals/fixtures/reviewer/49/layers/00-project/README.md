# timesheet

Summarize time entries per project.

Entries are CSV lines `date, project, minutes` with ISO dates (YYYY-MM-DD).
Blank lines and lines starting with `#` are ignored.

    node bin/report.js entries.csv

prints the total hours per project, one line per project, sorted by project
name.

Run the tests with `npm test`.
