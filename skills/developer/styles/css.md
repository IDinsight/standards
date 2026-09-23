# CSS Development Style

Apply with `universal.md` for CSS or equivalent styling implementation.

- Follow the repository's established styling system, naming convention,
  preprocessing, and component-scoping rules.
- Keep selectors as local and low-specificity as practical. Avoid `!important`
  except where an established project convention or external constraint requires
  it.
- Reuse existing design tokens, custom properties, spacing scales, breakpoints,
  and shared primitives before adding near-duplicates.
- Build responsive behavior from content and existing project breakpoints rather
  than arbitrary device-specific assumptions.
- Preserve usable focus indicators and interactive states.
- Respect reduced-motion and other established accessibility preferences when
  adding animation or transitions.
- Avoid layout rules that depend on fragile DOM depth or incidental sibling
  ordering when a clearer component-level hook exists.
- Prefer logical properties when they fit project browser support and improve
  writing-mode resilience.
- Remove obsolete rules introduced by the changed component or feature; do not
  perform unrelated stylesheet cleanup.
