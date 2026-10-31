<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-bulk-import-endpoint-for-20260923T141500Z-5c1e9a47
-->

# Beneficiary Bulk Import

## Goal

Field coordinators collect beneficiary details on paper and in spreadsheets
during each enrolment drive, then enter them one at a time through the
beneficiary API. They need to submit a whole file of beneficiary records at
once and get a clear account of any rows that need fixing, without weakening
the checks that single-record registration applies.

## Constraints

- The import is part of the existing beneficiary API and uses its existing
  authentication and permissions; no new user roles are introduced.
- Files are UTF-8 CSV, possibly starting with a byte order mark, with a header
  row naming the columns `national_id`, `full_name`, `sex`, `date_of_birth`,
  `phone`, and `village`. Values follow the single-record API: `sex` is `F`,
  `M`, or `X`, `date_of_birth` is `YYYY-MM-DD`, `phone` may be empty, and
  `village` is an existing village code.
- Existing single-record create, list, retrieve, update, and delete behavior
  stays unchanged.

## Non-goals

- Updating or merging existing beneficiaries from a file.
- Importing villages or any other record type.
- File formats other than CSV.
- A user interface for uploading files.

## Work

### 1. Submit a file of beneficiaries

**Intent:** Coordinators can hand the registry a whole enrolment list instead
of registering each beneficiary separately, under the same access rules as
single-record registration.

**Done when:**

- `AC-001`: A user with the existing permission to add beneficiaries can
  submit a CSV file with the columns listed under Constraints to a single
  import endpoint of the beneficiary API.
- `AC-002`: An unauthenticated request, or a user without the permission to
  add beneficiaries, is refused and no beneficiaries are created.

**Depends on:** None.

### 2. Validate the whole file before creating anything

**Intent:** A file is accepted only as a whole, so coordinators correct a list
and resubmit it instead of working out which rows were saved, and the registry
never receives a record that single-record registration would refuse.

**Done when:**

- `AC-003`: Each row is validated with the same rules as creating one
  beneficiary through the API, and the import result reports every rejected row
  by its row number (the first data row after the header is row 1) together
  with its validation errors.
- `AC-004`: A row whose national ID already belongs to a beneficiary, or
  repeats the national ID of an earlier row in the same file, is rejected, and
  the existing beneficiary is not changed.
- `AC-005`: If any row is rejected, or the file lacks a required column, no
  beneficiaries from that file are created.
- `AC-006`: A file with no rejected rows creates one beneficiary per row,
  each recorded as created by the submitting user, and the import result
  reports how many beneficiaries were created.
- `AC-007`: A file with more than 5,000 data rows is refused without creating
  any beneficiaries.

**Depends on:** 1.

### 3. Notify imported beneficiaries

**Intent:** Imported beneficiaries learn that they are registered in the same
way as beneficiaries registered one at a time.

**Done when:**

- `AC-008`: Each beneficiary created by an import receives the same
  registration SMS as a beneficiary created one at a time, and no SMS is sent
  for an import that creates no beneficiaries.

**Depends on:** 2.

## Assumptions

- Files from an enrolment drive typically hold a few hundred rows.
