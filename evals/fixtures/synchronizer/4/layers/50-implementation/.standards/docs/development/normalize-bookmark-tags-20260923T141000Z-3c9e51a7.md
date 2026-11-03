<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: normalize-bookmark-tags-20260923T141000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `normalize-bookmark-tags-20260923T141000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Normalize bookmark tag names when saving and match tag lookups the same way.`

## Build Steps

### DEV-001 — Normalize tag names when parsing

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Store every tag in one canonical form so the same tag typed differently is
kept once.

**Affected Area**

`bookmarks/tags.py` (`parse_tags`, new `normalize_tag`).

**Expected Outcome**

`parse_tags` trims each tag, collapses inner whitespace to single spaces,
lowercases it, drops empty segments, and keeps only the first occurrence of a
repeated tag, in input order.

**Self-Check**

`python3 -m pytest -q` in the project root on the working tree with this step
applied (uncommitted, on top of the STANDARDS installation commit): exit 0,
2 passed. `python3 -c "from bookmarks.tags import parse_tags; print(parse_tags(' News , news,Tech  Talk,,'))"`
printed `['news', 'tech talk']`. Limitation: the existing tests do not cover
mixed case or duplicates.

### DEV-002 — Match tag lookups with the same normalization

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let lookups find bookmarks regardless of how the query tag is typed.

**Affected Area**

`bookmarks/store.py` (`BookmarkStore.with_tag`).

**Expected Outcome**

`with_tag` normalizes its argument with `normalize_tag` before matching, so
`with_tag(' PYTHON ')` finds a bookmark saved with tag `Python`.

**Self-Check**

`python3 -m pytest -q` in the project root on the working tree with both steps
applied (uncommitted): exit 0, 2 passed. A `python3 -c` session that added
`https://a.example` with tags `Python` and called `with_tag(' PYTHON ')`
returned that bookmark.

## Plan Notes

Expedited cycle: the checks above are Developer self-checks only. Both steps
were committed together after the self-checks passed.
