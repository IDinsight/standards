<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-an-optional-maxlength-option-to-20260924T083000Z-4e9b21c7
-->

# Development Plan

`Cycle`: `add-an-optional-maxlength-option-to-20260924T083000Z-4e9b21c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add an optional maxLength option to slugify that shortens long slugs at a word boundary.`

## Build Steps

### DEV-001 — Optional maxLength in slugify

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let callers cap slug length while keeping whole words where possible.

**Affected Area**

`src/slug.js` (`slugify`), `test/slug.test.js`.

**Expected Outcome**

`slugify(input, { maxLength })` returns the normal slug when it fits. A longer
slug is cut at the last hyphen within `maxLength` characters; a slug with no
hyphen in that range is cut to exactly `maxLength` characters. Calls without
the option behave as before.

**Self-Check**

`node --test test/slug.test.js` in the project root, on the working tree with
the DEV-001 changes to `src/slug.js` and `test/slug.test.js` before commit:
exit 0, 6 tests passed (3 existing, 3 new for `maxLength`). This is Developer
feedback, not formal Tester verification.

**Implementation Notes**

The option is read from a destructured second argument with a default of `{}`
so existing one-argument callers are unaffected.

## Plan Notes

Plan approved by the user before implementation; single-step expedited change.
