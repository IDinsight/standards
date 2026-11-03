<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: collapse-repeated-hyphens-in-slugs-20260924T090000Z-3e9b7c41
-->

# Development Plan

`Cycle`: `collapse-repeated-hyphens-in-slugs-20260924T090000Z-3e9b7c41` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Collapse repeated hyphens in generated slugs.`

## Build Steps

### DEV-001 — Collapse hyphen runs in slugify

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Generated slugs never contain two or more consecutive hyphens and never start
or end with a hyphen.

**Affected Area**

`src/slug.js` (`slugify`), `test/slug.test.js`.

**Expected Outcome**

`slugify('Q3 - Results')` returns `q3-results`; `slugify('--Draft--')` returns
`draft`; existing behavior for ordinary titles is unchanged.

**Self-Check**

`node --test test/slug.test.js` in the project root on the working tree with
the updated `src/slug.js` and `test/slug.test.js`: exit 0, 5 tests passed,
0 failed.
