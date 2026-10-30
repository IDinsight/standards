<!-- STANDARDS
Artifact: DOCUMENTATION
Cycle: list-filters-guide-20260910T141500Z-3c9e0b71
-->

# Documentation Record

`Cycle`: `list-filters-guide-20260910T141500Z-3c9e0b71` `Status`: `COMPLETE`
`Collaboration`: `AUTONOMOUS` `Target`: `FILE` `Target Detail`:
`docs/usage.md` `User Style`: `NONE`

## Assessed Inputs and Boundary

- Scope `.standards/docs/scope/list-filters-guide-20260910T141500Z-3c9e0b71.md`
  and technical design
  `.standards/docs/specs/list-filters-guide-20260910T141500Z-3c9e0b71.md`:
  current acceptance set AC-001 and AC-002.
- Implementation: `src/records/filter.ts`, `src/records/store.ts`,
  `src/routes/records.ts` at commit
  `${COMMIT:Document listing and filtering records}`.
- Editing boundary: `docs/usage.md` only. README layout section inspected but
  not edited.
- Clean working tree at the assessed commit; nothing staged, unstaged, or
  untracked.

## Documentation Work and Evidence

- Audience: administrators and admin-tool developers. Surface: `docs/usage.md`,
  sections Listing records, Filtering, and Errors.
- AC-001: the Filtering section lists `status`, `owner`, and `q`, the AND
  combination, and that blank values and other parameters are ignored;
  matches `parseFilter` and `RecordStore.list`.
- AC-002: the Errors table lists 400, 401, 403, 404, 405, and 500 with the
  `{"error": "..."}` shape; matches `Router.handle` and `authorize`.
- Saved outcome: `docs/usage.md` blob `${BLOB:docs/usage.md}`, inspected after
  saving.

## Checks and Applicability

- Inspection of every example request in `docs/usage.md` against
  `test/routes.test.ts` expectations: consistent.
- `pnpm --filter export test` in the project root at the assessed commit:
  exit 0, 16 tests passed. Establishes that the documented behavior is the
  tested behavior; it is not formal acceptance evidence.

## Discrepancies, Dependencies, and Remaining Work

NONE.

## Resume and Conclusion

- Next action: none; final-deliverable review in a fresh session.
- Blocking question: NONE.
- The selected target and the full Documenter gate are complete for the
  assessed inputs.
