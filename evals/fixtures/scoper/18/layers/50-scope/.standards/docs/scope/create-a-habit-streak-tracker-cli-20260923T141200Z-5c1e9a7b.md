<!-- STANDARDS
Artifact: SCOPE
Cycle: create-a-habit-streak-tracker-cli-20260923T141200Z-5c1e9a7b
-->

# Habit Streak Tracker CLI

## Goal

Give one person a local command-line tool to record daily habit check-ins and
see their current streaks, without a hosted service or account.

## Constraints

- Runs locally from a terminal; habit data stays on the user's machine.
- Single user; no accounts or authentication.

## Non-goals

- Syncing between machines.
- Reminders or notifications.
- A graphical or web interface.
- Editing or back-filling check-ins for past days.

## Work

### 1. Habit management

**Intent:** Let the user define the habits they want to track.

**Done when:**

- `AC-001`: The user can add a habit by name and list all habits.
- `AC-002`: Adding a habit whose name already exists is rejected with a message
  and leaves the habit list unchanged.

**Depends on:** None

### 2. Daily check-ins and streaks

**Intent:** Let the user record that a habit was done today and see how long
they have kept it up.

**Done when:**

- `AC-003`: The user can mark a habit done for today; marking it again on the
  same day does not count twice.
- `AC-004`: Listing habits shows each habit's current streak: the number of
  consecutive days with a check-in, ending today or yesterday, or 0 otherwise.

**Depends on:** 1

### 3. Persistence

**Intent:** Keep the user's habits and history between runs.

**Done when:**

- `AC-005`: Habits and check-ins persist across separate invocations of the
  tool.

**Depends on:** 1, 2

### 4. Usage documentation

**Intent:** Let a new user install and use the tool without reading the code.

**Done when:**

- `AC-006`: The README explains how to install the tool and how to use each
  command.

**Depends on:** 1, 2, 3

## Assumptions

- "Today" is the local calendar date of the machine running the tool.
