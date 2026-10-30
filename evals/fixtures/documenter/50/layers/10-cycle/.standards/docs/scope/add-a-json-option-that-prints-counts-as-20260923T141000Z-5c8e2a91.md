<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-json-option-that-prints-counts-as-20260923T141000Z-5c8e2a91
-->

# JSON Output for tally

## Goal

Let scripts consume `tally` results without parsing fixed-width columns by
adding an option that prints counts as JSON. People who use the default output
must see no change.

## Constraints

- No new runtime dependencies.
- Existing options, default output, and exit statuses stay compatible.

## Non-goals

- Other machine-readable formats (CSV, TSV).
- Changing how lines, words, or characters are counted.

## Work

### 1. JSON output option

**Intent:** Give scripts a stable, machine-readable form of every count.

**Done when:**

- `AC-001`: `tally --json FILE...` prints one JSON object per input file containing the file name and its line, word, and character counts.
- `AC-002`: `tally --json` reading standard input prints one JSON object whose file name is `null`.
- `AC-003`: Without `--json`, output and exit status are unchanged for every existing option combination.

**Depends on:** None

### 2. Usage guide

**Intent:** Users can learn about the option and its output shape from the existing guide.

**Done when:**

- `AC-004`: `docs/usage.md` documents `--json` and its output shape, with an example.

**Depends on:** Work item 1
