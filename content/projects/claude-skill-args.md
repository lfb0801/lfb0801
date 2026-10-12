# claude-skill-args

> Status: public, open source — [github.com/lfb0801/claude-skill-args](https://github.com/lfb0801/claude-skill-args)

A Claude Code mod that lets any skill offer a fixed set of choices as `!value` arguments.

```text
/review !ruthless !scope the onboarding redesign
```

## The problem

A skill normally receives one blob of free text and has to guess what the user meant. The user must remember what the skill understands, misspellings pass silently, and missing input is discovered halfway through the run.

## The approach

The choices are declared once, in the skill's frontmatter. The user picks them with `!value`, using autocomplete or clickable cards, and the skill reads each one as its own named argument (`$intensity`, `$focus`, `$target`).

- missing required values are asked for before the skill starts
- optional values reach the skill as an empty string
- open arguments also accept values outside the declared list
- one free-text argument collects every plain word

## Constraints that shaped it

- **The skill body must not change.** skill-args only rewrites what the user typed into the positional arguments Claude Code already supports, so `$name`, `$0` and `$ARGUMENTS[0]` keep working.
- **Skills without the declaration behave exactly as before.** Adoption is opt-in per skill.
- **It only acts on user-typed commands.** A skill that Claude invokes on its own is never touched, so a skill must set `disable-model-invocation: true`.

## What the edge cases taught me

Most of the work was deciding what an unknown `!value` should mean. It fills the first empty open argument; failing that, it counts as an invalid value for the first empty required strict argument, which is asked again; otherwise it stays in the free text. A later fix made unknown values for optional choices stay in the free text rather than vanish.

Quoting was the other trap: arguments with spaces or quotes have to arrive at the skill intact.

## What I would do differently

Start from the demo skill, not the feature list. A skill that echoes what it receives made every parsing rule testable by eye before it was testable by code.
