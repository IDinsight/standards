# shiftlog usage guide

This guide is for people who keep their own timesheets with shiftlog. It explains how to write a shift file, how the weekly report works out billable hours, and what happens when a line cannot be read.

## Recording shifts

Keep one shift per line in a plain-text file:

```text
2026-09-21 09:00-12:10
```

Each line holds the date as `YYYY-MM-DD`, a space, and the start and end times as 24-hour `HH:MM` joined by a hyphen. A shift must end after it starts on the same day, so a shift that crosses midnight is rejected. Blank lines and lines starting with `#` are skipped, so you can keep notes in the file.

## Weekly report

Run the `week` command with the path to your shift file:

```text
python3 -m shiftlog week FILE
```

It prints one line per day, in date order, with that day's billable hours to two decimal places, followed by a `Total` line.

## Rounding

Each shift is rounded to the nearest quarter hour before it is added to the day's total. Days with several shifts add up the rounded shifts.

For example, `examples/shifts.txt` contains:

```text
# Week of 2026-09-21
2026-09-21 09:00-12:10
2026-09-22 13:00-17:20
```

and the report for it is:

```text
$ python3 -m shiftlog week examples/shifts.txt
2026-09-21  3.25
2026-09-22  4.25
Total       7.50
```

## Errors

If a line cannot be read, shiftlog prints the line number and the problem to standard error and exits with status 1 without printing a report, for example:

```text
shiftlog: line 4: shift must end after it starts
```

A file that cannot be opened also exits with status 1. Running the command with missing or extra arguments prints the usage line and exits with status 2.
