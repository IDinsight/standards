# Whole-Repository Audit

Use for `BROWNFIELD` work when no usable project-context baseline exists.

The goal is to establish `.standards/CONTEXT.md` from primary repository evidence without turning it into an exhaustive repository inventory.

## Procedure

1. Start from `Active Work.Request`, project instructions, and the repository itself.
2. Map the project at repository level before going deep:
   - purpose and major runtime boundaries;
   - languages, runtimes, frameworks, package/build tooling;
   - major source, test, configuration, documentation, and deployment areas;
   - established commands and conventions;
   - external systems, persistence, and integration boundaries;
   - testing and verification mechanisms.
3. Follow dependencies and shared packages only far enough to understand the active work and the constraints it inherits.
4. For monorepos, establish global conventions plus the target workspace and material shared dependencies; do not deep-audit unrelated workspaces.
5. Deepen the scan only in areas relevant to the active request or required to establish project-wide constraints.
6. Write `.standards/CONTEXT.md` using `../template.md`.

## Mode-specific completion condition

The resulting baseline must be sufficient for downstream roles to work without rediscovering the repository's fundamental structure, tooling, conventions, and relevant existing behavior.
