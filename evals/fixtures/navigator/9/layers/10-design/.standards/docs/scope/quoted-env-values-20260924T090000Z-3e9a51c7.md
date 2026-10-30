<!-- STANDARDS
Artifact: SCOPE
Cycle: quoted-env-values-20260924T090000Z-3e9a51c7
-->

# Quoted Values in Configuration Files

## Goal

Let configuration files hold values that contain `#`, leading or trailing
spaces, or control characters by wrapping them in double quotes, without
changing how existing unquoted files are read.

## Constraints

- Errors keep the existing `ParseError` contract: a 1-based `line` property
  and a message naming the line.

## Non-goals

- Single-quoted values, variable expansion, and values spanning several lines.

## Work

### 1. Double-quoted values

**Intent:** Users need a way to write values the unquoted form cannot express.

**Done when:**

- `AC-001`: A value wrapped in double quotes is returned without the quotes,
  keeping any `#`, `=`, and spaces inside the quotes.
- `AC-002`: Inside double quotes, `\n`, `\t`, `\"`, and `\\` are decoded; any
  other backslash sequence is rejected with a `ParseError` naming the line.
- `AC-003`: An unterminated quoted value, or text other than a comment after
  the closing quote, is rejected with a `ParseError` naming the line.

**Depends on:** None

### 2. Existing files keep working

**Intent:** Current users must not see different values after upgrading.

**Done when:**

- `AC-004`: Values that do not start with a double quote parse exactly as
  before, including inline comments and trimming.

**Depends on:** None
