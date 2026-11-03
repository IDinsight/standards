# Bootstrap Demo

## Goal

Give prospects a self-serve demo. They create a trial workspace that already
contains sample data, so they can explore the product without a sales call.

## Non-goals

- Billing, payment collection, or plan upgrades.
- Importing a prospect's own data.

## Work

### 1. Trial signup

**Intent:** Let a prospect start a trial without contacting sales.

**Done when:**

- `AC-001`: A visitor can start a trial workspace by submitting a single signup form.
- `AC-002`: A trial workspace stops accepting sign-ins 14 days after it was created.

**Depends on:** None

### 2. Sample data

**Intent:** Show the product's value from the first screen a prospect sees.

**Done when:**

- `AC-003`: A new trial workspace opens with sample projects and tasks already present.

**Depends on:** 1

## Assumptions

- The demo is offered in English only.
