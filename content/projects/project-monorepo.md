# Project monorepo

> Status: active case study

The project monorepo brings related applications, libraries, delivery definitions, and engineering guidance into one versioned workspace. Its purpose is not to put everything in one repository; it is to make changes that belong together observable as one change.

## The problem

Repository boundaries can become coordination boundaries. A single product change may require compatible edits across a service, a shared library, infrastructure, and documentation, while separate review and release paths hide the relationship between them.

A monorepo removes some of that distance, but introduces a different risk: accidental coupling through shared structure, broad pipelines, and unclear ownership.

## Design principles

- **Colocation does not imply coupling.** Projects keep explicit dependency and ownership boundaries inside the shared workspace.
- **One change should tell one story.** Related code, delivery, and documentation can be reviewed together.
- **Validation follows impact.** The repository should calculate affected work without making correctness depend on a developer predicting every consequence.
- **Shared tooling remains versioned.** Convenience should not turn internal dependencies into invisible global state.
- **Repository-wide rules stay few.** Only constraints that genuinely apply everywhere belong at the root.

## Architectural boundary

The repository is a coordination mechanism, not the architecture itself. Directory layout can reveal boundaries, but build graphs, published interfaces, ownership, and deployment independence determine whether those boundaries are real.

## What I am evaluating

- whether cross-project changes become easier to understand and review
- whether affected-project detection keeps feedback focused without missing evidence
- whether teams can retain independent release decisions
- whether shared tooling reduces duplication without creating implicit coupling
- whether repository navigation makes ownership and intent discoverable

The monorepo earns its cost when it reduces coordination overhead while keeping project boundaries more explicit, not less.
