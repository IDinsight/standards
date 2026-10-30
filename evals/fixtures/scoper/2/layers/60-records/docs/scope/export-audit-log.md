# Audit Log Export

## Goal

Compliance reviews each quarter need a copy of the audit log outside the
console. Administrators should be able to download the entries they are looking
at in the audit log view as a CSV file they can open in a spreadsheet, without
the export becoming a way around the view's filters or access rules.

## Constraints

- The export uses the filters the audit log view already offers: actor, action,
  and date range.
- Access to the export follows the existing audit log permission; who may see
  the audit log does not change.

## Non-goals

- Scheduled, recurring, or emailed exports.
- Export formats other than CSV.
- Changes to what the audit log records or to the audit log view itself.

## Work

### 1. CSV download of the audit log

**Intent:** Give administrators a file they can hand to compliance reviewers.

**Done when:**

- `AC-001`: An administrator can download the audit log as a CSV file with a
  header row and one row per entry giving the entry's timestamp, actor, action,
  and target, and the file opens correctly in a spreadsheet even when a value
  contains commas, double quotes, or line breaks.

**Depends on:** None

### 2. Existing filters and permissions apply to the export

**Intent:** The export must contain exactly what the administrator could see in
the view, and nothing for anyone who cannot see the view.

**Done when:**

- `AC-002`: An export contains exactly the entries the audit log view shows for
  the same actor, action, and date-range filters, and a user who cannot view the
  audit log is refused the export in the same way the view refuses them.

**Depends on:** Work item 1.

## Assumptions

- Exports are no larger than what the audit log view already loads at once.
