<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41
-->

# Technical Design

## Context

- Scope: one reminder email 24 hours before each booked appointment, none for
  short-notice bookings, none after cancellation.
- booking-api owns no data store; appointments live in records-api and email
  goes through the mailer service (`.standards/CONTEXT.md`).
- Project context records that production runs a single booking-api instance
  and that booking-api has no background work today.

## Decision

Add an in-process reminder scheduler to booking-api. It keeps pending reminders
in memory, one timer per appointment, and sends each reminder through the
existing mailer client when its timer fires. Because production runs a single
instance, one in-memory scheduler sees every booking and cancellation and sends
each reminder exactly once, with no cross-process coordination and no
records-api changes.

## Acceptance Coverage

- `AC-001`: Scheduler timer at `startsAt - 24h`; startup load of upcoming
  appointments; reminder sent through `mailer.send`.
- `AC-002`: The scheduler holds at most one pending reminder per appointment id
  and drops it after sending; the single production instance makes this hold
  service-wide.
- `AC-003`: Scheduling skips appointments whose reminder time has already
  passed.
- `AC-004`: Cancellation removes the pending reminder before it fires.

## Components

- `src/reminders.js` (new) — `createReminderScheduler({ mailer, now, setTimer,
  clearTimer })` with `schedule(appointment)`, `unschedule(id)`, and
  `pending()`.
- `src/appointments.js` — calls `schedule` after a successful booking and
  `unschedule` after a cancellation.
- `src/server.js` — creates the scheduler at startup and schedules every
  upcoming `BOOKED` appointment returned by `service.upcoming()`.

## Interfaces and Contracts

- Reminder email: `to` is the patient email, `subject` is
  `Appointment reminder`, and `text` names the start time formatted with
  `formatTime`.
- Reminder time is exactly `startsAt` minus 24 hours (UTC). A timer that fires
  late still sends if the appointment has not started.
- Delays longer than the `setTimeout` limit (about 24.8 days) are re-armed in
  steps.

## Data and Control Flow

1. Startup: load upcoming appointments from records-api and schedule each one
   whose reminder time is in the future.
2. Booking: after records-api stores the appointment and the confirmation is
   sent, schedule its reminder.
3. Cancellation: after records-api marks it `CANCELLED`, unschedule it.
4. Timer fires: send the reminder, then forget the appointment id.

## Technical Acceptance Criteria

- `AC-001`: A reminder is sent no later than one minute after
  `startsAt - 24h` while the process is running.
- `AC-002`: Calling `schedule` twice for the same id leaves one pending
  reminder, and a sent reminder is never re-armed by the process.
- `AC-003`: `schedule` for an appointment less than 24 hours away creates no
  timer.
- `AC-004`: `unschedule` clears the timer, and a cleared reminder never sends.

## Build Plan

1. Scheduler module with injected clock and timer functions.
2. Hook booking and cancellation into the scheduler.
3. Startup load in `src/server.js`.

## Risks and Follow-up

- Reminders whose time passes while the process is down are skipped on the next
  start.
- Mailer failures are logged and not retried.

## Alternatives

- A separate cron worker deployment: rejected as an extra deployable for a
  single-instance service.
