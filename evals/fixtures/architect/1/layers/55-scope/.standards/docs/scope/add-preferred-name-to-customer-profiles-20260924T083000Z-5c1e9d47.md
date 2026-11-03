<!-- STANDARDS
Artifact: SCOPE
Cycle: add-preferred-name-to-customer-profiles-20260924T083000Z-5c1e9d47
-->

# Customer Preferred Name

## Goal

Some customers want to be addressed by a name other than the full name on
their record. Customers need an optional preferred name on their profile that
they can see and change, without disturbing the profiles of customers who never
set one.

## Constraints

- The existing profile read and profile edit operations are the surfaces for
  this change; no new endpoints are requested.
- Existing customer records must stay readable and editable without any
  backfill of data.
- A preferred name, when set, is free text of at most 80 characters after
  surrounding whitespace is removed. Setting it to an empty value or null
  clears it.

## Non-goals

- Using the preferred name in emails, invoices, exports, or any other output.
- Searching or sorting customers by preferred name.
- Filling in preferred names for existing customers.

## Work

### 1. Preferred name on the customer profile

**Intent:** Let a customer record and see the name they want to be addressed
by, as an optional part of their profile.

**Done when:**

- `AC-001`: An optional `preferred_name` field appears in customer profile
  reads.
- `AC-002`: Users may edit `preferred_name` through the profile edit operation,
  within the constraints above.
- `AC-003`: Existing customer records may remain without a preferred name;
  their `preferred_name` reads as null until edited.

**Depends on:** None

## Assumptions

- Storing the preferred name may require a small change to the customer
  database schema.
