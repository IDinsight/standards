<!-- STANDARDS
Artifact: SCOPE
Cycle: send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41
-->

# Appointment Reminders

## Goal

Patients miss fewer appointments when they get a reminder the day before.
booking-api should email each patient a reminder 24 hours before a booked
appointment, without reminding anyone about an appointment that was cancelled.

## Constraints

- Reminders are sent through the existing mailer service.

## Non-goals

- SMS or push reminders.
- Patient- or clinic-configurable reminder times.
- Changes to the existing booking confirmation email.

## Work

### 1. Reminder before each appointment

**Intent:** Give every patient with a booked appointment one timely reminder.

**Done when:**

- `AC-001`: A reminder email is sent to the patient's address 24 hours before
  each booked appointment's start time.
- `AC-002`: Each appointment receives at most one reminder.
- `AC-003`: An appointment booked less than 24 hours before it starts receives
  no reminder.

**Depends on:** None

### 2. Cancellation stops reminders

**Intent:** Patients are not reminded about appointments that no longer exist.

**Done when:**

- `AC-004`: Cancelling an appointment before its reminder time means no reminder
  is sent for it.

**Depends on:** 1

## Assumptions

- A reminder sent within a minute of the 24-hour mark counts as 24 hours before.
