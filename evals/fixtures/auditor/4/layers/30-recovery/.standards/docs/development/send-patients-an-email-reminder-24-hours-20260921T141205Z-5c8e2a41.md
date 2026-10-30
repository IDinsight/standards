<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41
-->

# Development Plan

`Cycle`: `send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41.md`
- `Architecture`: `.standards/docs/specs/send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41.md`
- `Request`: `Email patients a reminder 24 hours before each booked appointment.`

## Build Steps

### DEV-001 — In-process reminder scheduler

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Provide the scheduler module the design defines, with injected clock and timer
functions.

**Affected Area**

`src/reminders.js` (new).

**Expected Outcome**

`createReminderScheduler` schedules one reminder per appointment id at
`startsAt - 24h`, skips appointments less than 24 hours away, sends through the
mailer client, and forgets an id after sending.

**Self-Check**

Planned: `node --test test/appointments.test.js` from the project root plus a
scripted run with a fake clock and timers. Not yet run.

### DEV-002 — Schedule on booking, clear on cancellation

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-001, AC-004`

**Goal**

Connect booking and cancellation to the scheduler.

**Affected Area**

`src/appointments.js`.

**Expected Outcome**

A successful booking schedules its reminder; a cancellation unschedules it, so
a cancelled appointment never receives a reminder.

**Self-Check**

Planned: `node --test test/appointments.test.js` from the project root. Not yet
run.

### DEV-003 — Load upcoming appointments at startup

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-001, AC-002`

**Goal**

Re-arm reminders for appointments already booked when the process starts.

**Affected Area**

`src/server.js` startup block.

**Expected Outcome**

On start, every upcoming `BOOKED` appointment whose reminder time is still in
the future has exactly one pending reminder.

**Self-Check**

Planned: start the server against stub records-api and mailer endpoints and
inspect `pending()`. Not yet run.

## Plan Notes

Before starting DEV-001, the deployment manifest was checked to confirm how the
scheduler would run in production. The manifest did not obviously match the
single-instance deployment in project context, so the topology question was
routed to Auditor before any implementation.

### Suspended Assignment 1

`Recovery Frame`: `1`
`Recovery Reason`: `Project context records a single production instance, but deploy/production.yaml may say otherwise; deployment topology in context may be stale.`
`Purpose`: `DEVELOPMENT`
`Target`: `NONE`
`Assessed Inputs`: `plan and source at ${COMMIT:Plan appointment reminder implementation}; no implementation changes made`
`Next Action`: `Start DEV-001 once project context is corrected and any affected upstream work is re-established.`
