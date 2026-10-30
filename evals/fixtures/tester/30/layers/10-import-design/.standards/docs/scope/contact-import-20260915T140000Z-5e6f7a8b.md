<!-- STANDARDS
Artifact: SCOPE
Cycle: contact-import-20260915T140000Z-5e6f7a8b
-->

# Contact Import Validation and Saving

## Goal

Make loading contacts from a JSON file fail clearly on bad input, and let
callers save a directory back to a file that can be loaded again.

## Constraints

- The existing `Directory` API keeps its current behavior.
- No new runtime dependencies.

## Non-goals

- CSV or other file formats.
- Merging a file into an existing directory.

## Work

### 1. Validate imports

**Intent:** A malformed contacts file should fail with an error a person can
act on instead of loading partial or broken data.

**Done when:**

- `AC-001`: Loading a file whose JSON is not an array fails with an error that
  names the file.
- `AC-002`: Loading fails with an error that names the row number when a row
  has no id or name, or repeats an earlier row's id.
- `AC-003`: Email addresses are stored trimmed and lowercased after loading.

**Depends on:** None

### 2. Save directories

**Intent:** Callers can persist changes made to a loaded directory.

**Done when:**

- `AC-004`: Saving a directory writes a JSON file that loading reads back to
  the same contacts.

**Depends on:** None

### 3. Document loading and saving

**Intent:** Library users know what loading checks and how to save.

**Done when:**

- `AC-005`: The README explains loading, its validation errors, and saving.

**Depends on:** Work items 1 and 2
