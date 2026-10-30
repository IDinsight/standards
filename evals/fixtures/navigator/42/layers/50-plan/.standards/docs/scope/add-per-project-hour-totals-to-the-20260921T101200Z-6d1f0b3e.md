<!-- STANDARDS
Artifact: SCOPE
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
-->

# Per-Project Hour Totals

## Goal

Team leads want to see how a week's hours split across projects without opening
the CSV export in a spreadsheet. The weekly report gains an option that lists the
hours per project under the existing total.

## Constraints

- The existing `report` output without the new option stays unchanged.
- Input remains the existing `date,project,hours` CSV export.

## Non-goals

- Date ranges other than a single week.
- Output formats other than plain text.

## Work

### 1. Per-project breakdown

**Intent:** Let a team lead see where the week's hours went.

**Done when:**

- `AC-001`: `report <file> <date> --by-project` prints the weekly total followed
  by one line per project with hours logged that week, ordered by hours
  descending and then by project name.
- `AC-002`: Each project's hours are shown rounded to at most two decimal places.
- `AC-003`: Only entries dated within the selected week, Monday through Sunday
  inclusive, count toward the per-project lines.

**Depends on:** None

### 2. Usage documentation

**Intent:** Users can discover the option without reading the source.

**Done when:**

- `AC-004`: The README explains the `--by-project` option and the week
  boundaries, and shows example output.

**Depends on:** 1
