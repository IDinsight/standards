# React Development Style

Apply with `universal.md` and the project's language style for React code.

- Use the repository's established component model and React version.
- Keep render logic pure. Perform side effects in the appropriate lifecycle or
  event boundary, not during render.
- Prefer derived values over duplicated state. Store only state that must
  persist independently across renders.
- Use effects for synchronization with external systems, not for ordinary data
  derivation that can happen during render or event handling.
- Keep component responsibilities focused. Extract a component or hook when it
  creates a meaningful boundary, not solely to reduce line count.
- Use stable semantic keys for lists; do not use array indexes when item
  identity can change.
- Preserve controlled versus uncontrolled input behavior intentionally.
- Keep accessibility semantics intact: labels, keyboard behavior, focus,
  landmarks, names, and state must remain usable without relying only on visual
  presentation.
- Avoid memoization by default. Add `memo`, `useMemo`, or `useCallback` when an
  established performance need or identity contract justifies it.
- Keep server, client, and shared concerns separated according to the hosting
  framework's established boundaries.
