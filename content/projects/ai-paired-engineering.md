# AI-paired engineering

> Status: active exploration

AI-paired engineering treats an agent as a participant in an existing engineering system: useful for exploration, implementation, and review, but bounded by the same constraints and evidence as any other contributor.

## The problem

An agent can produce code faster than a team can establish whether that code belongs. Without repository context it optimises for plausibility, and without explicit validation it can turn speed into review debt.

The answer is not a larger universal prompt. The relevant context should be selected by the task, close to its source, and reviewable by the people who own the system.

## Pairing model

The engineer owns intent, trade-offs, and acceptance. The agent can investigate the codebase, propose a plan, make bounded changes, and expose uncertainty. Tests, static analysis, diffs, and review remain the evidence through which the work earns trust.

Useful pairing preserves distinct moments:

- establish the goal and constraints before choosing an implementation
- inspect the local system before introducing a pattern
- separate a proposed plan from the changes that enact it
- make uncertainty and unverified assumptions visible
- review the resulting diff as engineering work, not generated output

## Design principles

- **Context is scoped, not accumulated.** More input is not automatically better input.
- **Verification is part of generation.** A change without evidence is an unfinished proposal.
- **Human accountability is not delegated.** Assistance can broaden judgment but cannot own it.
- **Repository guidance is a product.** Instructions need ownership, review, and retirement just like other interfaces.
- **Small diffs preserve understanding.** The cost of review should constrain the size of an autonomous step.

## What I am evaluating

- whether the pairing loop reduces time to a well-understood change
- whether reviews discuss design rather than reconstruct intent
- which context repeatedly prevents incorrect assumptions
- where agent autonomy stops improving flow and starts hiding risk

The objective is not maximum generated output. It is a tighter feedback loop in which engineering judgment remains visible.
