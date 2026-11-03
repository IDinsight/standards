<!-- STANDARDS
Artifact: SCOPE
Cycle: export-the-client-list-as-csv-20260922T141000Z-5c8e2a91
-->

# Client List CSV Export

## Goal

Let administrators download the active client list, including contact details,
as a CSV file they can open in a spreadsheet, without exposing that contact
data to anyone else.

## Constraints

- Use the existing roles, `member` and `admin`; no new role.
- The export is served at `GET /clients/export`.

## Non-goals

- Exporting archived clients.
- Choosing columns or filtering the export.
- Other export formats.

## Work

### 1. CSV export of active clients

**Intent:** The account team needs the client list in spreadsheets for
quarterly outreach.

**Done when:**

- `AC-001`: An administrator requesting `GET /clients/export` receives a CSV
  file named `clients.csv` with the header row `id,name,email,phone` and one row
  per client, with fields escaped per RFC 4180.
- `AC-002`: Archived clients do not appear in the export.

**Depends on:** None

### 2. Restricted access

**Intent:** Bulk client contact data is limited to administrators.

**Done when:**

- `AC-003`: A signed-out or non-administrator request to `GET /clients/export`
  receives status 403 and no client data.

**Depends on:** 1
