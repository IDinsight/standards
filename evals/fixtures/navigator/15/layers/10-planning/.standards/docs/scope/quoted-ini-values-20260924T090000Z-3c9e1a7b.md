<!-- STANDARDS
Artifact: SCOPE
Cycle: quoted-ini-values-20260924T090000Z-3c9e1a7b
-->

# Quoted INI Values

## Goal

Let configuration authors keep leading or trailing whitespace and special
characters in a value by writing it in double quotes, without changing how
existing unquoted files parse.

## Constraints

- Unquoted values keep their current behavior.
- No new runtime dependencies.

## Non-goals

- Single-quoted values, multi-line values, and inline comments.
- Changes to the command-line output format.

## Work

### 1. Double-quoted values

**Intent:** Values such as padded labels or messages with quotes cannot be
expressed today because values are always trimmed and taken literally.

**Done when:**

- `AC-001`: A value wrapped in double quotes is returned without the quotes,
  with its inner whitespace preserved exactly.
- `AC-002`: Inside a quoted value, the escape sequences for a double quote,
  backslash, newline (`n`), and tab (`t`) are decoded to those characters.
- `AC-003`: An unterminated quoted value, text after the closing quote, or an
  unknown escape sequence is rejected with a `ParseError` naming the line.
- `AC-004`: Unquoted values parse exactly as before.

**Depends on:** None
