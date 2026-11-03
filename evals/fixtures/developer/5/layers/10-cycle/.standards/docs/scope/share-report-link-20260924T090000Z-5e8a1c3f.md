<!-- STANDARDS
Artifact: SCOPE
Cycle: share-report-link-20260924T090000Z-5e8a1c3f
-->

# Report Share Links

## Goal

Report owners need to show a report to people who do not have an account in
the service. Owners should be able to hand out a link that lets the recipient
read that report, without opening up any other access.

## Constraints

- Signed-in access to `/reports` and `/reports/:id` stays owner-only and
  behaves as it does today.

## Non-goals

- Editing a report through a shared link.
- Sharing a list of reports.
- Sending links by email or any other channel.

## Work

### 1. Create a share link

**Intent:** Let an owner produce something they can pass on to a reader.

**Done when:**

- `AC-001`: The owner of a report can request a share link for it and receives a link they can pass on.
- `AC-002`: A share-link request for a report the caller does not own is refused with status 403, and one for a report that does not exist returns 404.

**Depends on:** None

### 2. Open a shared report

**Intent:** Let a reader without an account see the shared report.

**Done when:**

- `AC-003`: Anyone holding a share link can view the report's title and body without signing in.
- `AC-004`: The shared view is read-only and exposes no way to change the report.

**Depends on:** 1
