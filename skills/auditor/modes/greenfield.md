# Greenfield Audit

Use for the initial audit while `ProjectMode` is `GREENFIELD`.

The goal is to establish the factual baseline of the current repository or scaffold after scope and architecture are decided but before implementation begins.

## Procedure

1. Read the completed scope and technical design referenced by `.standards/STATE.md`.
2. Inspect the current repository or scaffold, project instructions, manifests, configuration, scripts, tests, and documentation needed to understand the starting point.
3. Separate three categories explicitly:
   - facts already present in the repository;
   - established project constraints that already apply;
   - planned architectural constraints from the completed design whose implementation does not yet exist.
4. Do not describe planned components, files, interfaces, commands, or behavior as existing facts until repository evidence supports them.
5. Capture enough baseline to let Developer distinguish what must be preserved from what the design requires it to create.
6. Write or refresh `.standards/CONTEXT.md` using `../template.md`.

## Mode-specific completion condition

The baseline must make the pre-implementation state clear enough that downstream roles cannot confuse planned architecture with existing implementation.
