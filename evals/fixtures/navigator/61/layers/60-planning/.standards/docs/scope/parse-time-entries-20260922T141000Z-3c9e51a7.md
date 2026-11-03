<!-- STANDARDS
Artifact: SCOPE
Cycle: parse-time-entries-20260922T141000Z-3c9e51a7
-->

# Timesheet Entry Parsing

## Goal

People tag timesheet lines with words like `#ops` so they can group time later, but today the tags end up inside the description. A single mistyped line also stops the whole run, so nobody sees the totals or the other mistakes. Entries should carry their tags separately, and every malformed line should be reported in one pass.

## Constraints

- Keep the existing line format: a date, a duration, then description words.
- No new runtime dependencies.

## Non-goals

- Totals per tag in the CLI output.
- Checking that a date exists on the calendar; only its shape is checked.
- New duration formats.

## Work

### 1. Entry fields

**Intent:** Each parsed entry must expose the parts of its line that later reporting relies on.

**Done when:**

- `AC-001`: A valid line yields its date, its duration in minutes, its description, and its tags.
- `AC-002`: Durations written in hours, minutes, or both (for example `2h`, `45m`, `1h30m`) are read as minutes; any other duration makes the line malformed.

**Depends on:** None

### 2. Tags

**Intent:** Keep tags out of the description so time can be grouped by tag later.

**Done when:**

- `AC-003`: Words that start with `#` are returned as tags without the `#` and are not part of the description.

**Depends on:** 1

### 3. Malformed lines

**Intent:** One mistake should not hide the rest of the timesheet or the other mistakes in it.

**Done when:**

- `AC-004`: A malformed line is reported with its line number and the reason, and the lines after it are still parsed.

**Depends on:** 1
