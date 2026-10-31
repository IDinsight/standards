<!-- STANDARDS
Artifact: SCOPE
Cycle: interval-durations-20260924T090000Z-3e8a51c7
-->

# Human-Readable Job Intervals

## Goal

Let operators write job intervals such as `1h30m` instead of computing the
number of seconds by hand, without breaking existing configs.

## Constraints

- Existing configs with integer intervals must keep loading unchanged.

## Non-goals

- Cron expressions or calendar-based schedules.
- Day, week, or millisecond units.
- Changes to `README.md` or `jobs.example.json`; the README does not describe
  interval syntax.

## Work

### 1. Duration intervals

**Intent:** Operators can express intervals in hours, minutes, and seconds, and
mistakes in an interval are reported clearly when the config loads.

**Done when:**

- `AC-001`: A job interval written as one or more number-and-unit parts using
  `h`, `m`, or `s` (for example `1h30m`, `45s`, `2h`) loads as the equivalent
  number of seconds.
- `AC-002`: An integer interval loads with its existing meaning, in seconds.
- `AC-003`: Loading a config whose interval is neither a positive integer nor a
  valid duration fails with an error naming the job and the rejected value.

**Depends on:** None
