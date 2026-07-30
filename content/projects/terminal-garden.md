# Terminal garden

> Status: working proof of concept

This portfolio started with a persistent image: a modern terminal types `show README.md`, then the screen opens into a Markdown reader.

## The design question

Can a portfolio feel exploratory without becoming difficult to use?

The answer in this first version is a progressive reveal. The terminal is initially the whole stage. It runs the opening command for the visitor, so nobody must understand the interface before seeing the content. From there, curious visitors can explore the filesystem themselves.

## Safety boundary

This is not a terminal emulator. The command engine:

- accepts only an explicit command allowlist
- resolves only paths in a fixed content manifest
- rejects chaining, redirection, pipes, and substitution syntax
- returns declarative UI actions instead of evaluating input

The performance suggests a sandbox; the implementation stays a static website.

## What this version is meant to teach

- whether the split-screen reveal feels memorable or slow
- whether Markdown files are a natural content-authoring model
- which commands improve discovery without turning the site into a toy
- how the experience should collapse on a phone

The interface is now concrete enough to answer those questions through use rather than speculation.
