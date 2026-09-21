# Gradle Forge

> Status: active case study

Gradle Forge is an opinionated foundation for JVM builds. It turns the decisions that every repository would otherwise rediscover—toolchains, testing, quality checks, publishing, and dependency policy—into a small set of composable conventions.

## The problem

A build can be green while its design steadily fragments. Copy-pasted configuration drifts, upgrades become repository-by-repository projects, and a change to an organisation-wide rule requires finding every local interpretation of it.

The difficult boundary is between consistency and ownership. Centralising every setting creates a framework teams cannot escape; leaving everything local makes consistency depend on memory.

## Design principles

- **Conventions over templates.** A generated repository starts consistent once. A convention plugin keeps the shared decision connected to its source.
- **Small capabilities over one universal plugin.** A service, library, and published component should compose only the build behaviour each one needs.
- **Defaults remain overridable.** The common path should be effortless without making exceptional requirements impossible.
- **Upgrades are product work.** Compatibility, migration paths, and release notes are part of the platform contract.
- **Failures should explain policy.** A guardrail is useful when it helps an engineer understand the constraint it protects.

## Architectural boundary

Gradle Forge owns shared build policy, not application architecture. It can establish a Java toolchain or a test suite, but it should not infer domain boundaries from project names. That distinction keeps the build platform reusable and application decisions visible in the application repository.

## What I am evaluating

- whether adopting a convention is easier than copying an existing build
- whether a Forge release can be upgraded independently of feature delivery
- whether exceptions remain explicit and reviewable
- whether build failures lead engineers to the relevant decision quickly

The intended result is not identical builds. It is a shared, evolvable foundation that lets meaningful differences remain visible.
