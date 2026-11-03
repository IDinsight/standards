<!-- STANDARDS
Artifact: SCOPE
Cycle: build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a
-->

# Time-Log Totals CLI

## Goal

Give the user a command-line tool that reads a plain-text time log and prints
how much time was spent on each project, so weekly totals no longer have to be
added up by hand.

## Constraints

- Runs with Node.js 22 and no third-party packages.
- Input is a UTF-8 text file with one entry per line in the form
  `YYYY-MM-DD <project> <duration>`, fields separated by whitespace;
  `<project>` contains no whitespace.
- A duration is `<hours>h`, `<minutes>m`, or `<hours>h<minutes>m` using whole
  numbers; in the combined form the minutes are 0 to 59.

## Non-goals

- Filtering by date range, or checking that a date is a real calendar date
  beyond its `YYYY-MM-DD` shape.
- Output formats other than the plain-text report (for example CSV or JSON).
- User-facing documentation such as a README or usage guide; the tool is for
  the user's own use.

## Work

### 1. Read time-log entries

**Intent:** Turn the lines of a log file into per-project durations.

**Done when:**

- `AC-001`: Each well-formed entry line contributes its duration, converted to
  minutes, to its project's total, for all three duration forms.
- `AC-002`: Blank lines, whitespace-only lines, and lines whose first
  non-space character is `#` are ignored.

**Depends on:** None

### 2. Report totals and reject malformed logs

**Intent:** Show the totals, and never show misleading totals for a log that
could not be read completely.

**Done when:**

- `AC-003`: For a well-formed log, the tool prints one line per project,
  `<project><TAB><H>:<MM>`, sorted by project name in case-sensitive character
  order, and exits with status 0. A log with no entries prints nothing.
- `AC-004`: If any line is malformed, the tool prints no report, writes an
  error naming the 1-based line number to standard error, and exits with
  status 1.

**Depends on:** 1
