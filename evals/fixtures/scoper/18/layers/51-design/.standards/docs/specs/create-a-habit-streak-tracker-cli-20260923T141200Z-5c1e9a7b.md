<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: create-a-habit-streak-tracker-cli-20260923T141200Z-5c1e9a7b
-->

# Technical Design

## Context

New repository with no existing implementation. The scope asks for a
single-user command-line tool that runs locally and keeps its data on the
user's machine.

## Decision

A Node.js 22 command-line program written as plain ES modules with no
third-party dependencies, storing all data in one JSON file. Tests use
`node:test`. A single file keeps installation trivial and the data easy to
inspect; the expected data volume is tiny.

## Acceptance Coverage

- `AC-001`: `add` and `list` commands over the habit store; names are trimmed
  and compared case-insensitively.
- `AC-002`: the store rejects a duplicate name before writing; the CLI prints
  the error on stderr and exits 1.
- `AC-003`: check-ins are stored as a set of local `YYYY-MM-DD` dates per
  habit; `done` adds today's date idempotently.
- `AC-004`: streaks are computed at read time from the check-in dates (see
  Data and Control Flow).
- `AC-005`: JSON data file at `$HABITS_FILE`, defaulting to `~/.habits.json`,
  written through a temporary file and rename.
- `AC-006`: No architectural impact; satisfied by the README, which the
  documentation phase owns.

## Components

- `bin/habits.js`: argument parsing, output formatting, exit codes.
- `src/store.js`: loading and saving the data file, habit and check-in rules.
- `src/streak.js`: streak calculation from a list of dates and today's date.

## Interfaces and Contracts

- Commands: `habits add <name>`, `habits done <name>`, `habits list`.
- Data file: `{ "version": 1, "habits": [{ "name": string, "created":
  "YYYY-MM-DD", "checkins": ["YYYY-MM-DD", ...] }] }`.
- Exit codes: 0 on success; 1 on a usage or validation error, with the message
  on stderr.

## Data and Control Flow

Each invocation loads the data file (a missing file is an empty store),
applies one command, and saves only if the data changed. The streak counts
consecutive dates backwards from today when today has a check-in, otherwise
from yesterday when yesterday has one, otherwise it is 0.

## Technical Acceptance Criteria

- `AC-003`: two `done` calls for the same habit on the same local date leave
  exactly one check-in for that date.
- `AC-005`: an interrupted save never leaves a truncated or partially written
  data file.

## Build Plan

1. Data file format and store module.
2. Streak calculation.
3. CLI commands wired to the store.
