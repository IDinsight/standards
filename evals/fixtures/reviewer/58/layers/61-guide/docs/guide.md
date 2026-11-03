# tally user guide

`tally` adds up the hours in a CSV time log and prints a total for each project
or for each day.

## Running tally

tally needs Node.js 22 or later and has no dependencies to install. From the
project folder, pass the path to your time log:

```sh
node bin/tally.js hours.csv
```

Options can come before or after the file name. If the file cannot be found,
tally prints `tally: cannot read <path>` and exits with status 1.

tally prints one line per project, sorted by name, with the hours to two
decimal places, and a final `TOTAL` line. For the example file in
[Input file](#input-file), the output is:

```text
alpha     7.50
beta      4.00
TOTAL    11.50
```

## Input file

The first line must be a header that names the columns `date`, `project`, and
`hours`. The names are not case-sensitive and the columns can be in any order.
Other columns are allowed and ignored. Blank lines are skipped.

```text
date,project,hours
2026-09-01,alpha,3.5
2026-09-01,beta,1.5
2026-09-02,alpha,4
2026-09-03,beta,2.5
```

- `date` must be written as `YYYY-MM-DD`, for example `2026-09-01`.
- `hours` must be a number of zero or more; decimals such as `1.5` are allowed.
- Values cannot contain commas. tally splits each line on commas and does not
  support quoted fields.

If a required column is missing, or a row has an invalid date or hours value,
tally prints an error that names the problem, followed by the usage summary,
and exits with status 2. Errors in rows give the line number in the file, for
example:

```text
tally: line 2: date must be YYYY-MM-DD
```

## Options

- `--by project|day` — group the totals by project or by date. Default:
  `project`. With `--by day`, each line shows a date instead of a project name,
  in date order.
- `--from YYYY-MM-DD` — count only entries on or after this date. Without it
  there is no lower limit.
- `--to YYYY-MM-DD` — count only entries on or before this date. Without it
  there is no upper limit.

An unknown option, a missing option value, a `--by` value other than `project`
or `day`, or a date not in `YYYY-MM-DD` form is a usage error: tally prints the
problem and the usage summary and exits with status 2.

Combining options, for the example file above:

```sh
node bin/tally.js hours.csv --by day --from 2026-09-02 --to 2026-09-03
```

```text
2026-09-02     4.00
2026-09-03     2.50
TOTAL          6.50
```
