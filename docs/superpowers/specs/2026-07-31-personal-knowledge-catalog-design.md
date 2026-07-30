# Personal Knowledge Catalog Expansion Design

## Context

The site currently presents a strong idea with very little evidence behind it: a terminal-shaped personal garden containing seven Markdown documents and roughly one thousand words. It names four recurring interests—Java and backend design, delivery systems, refactoring education, and AI-assisted engineering—but only the Terminal Garden itself has a project page, and only visible engineering reasoning has an idea page.

The expansion should make the promise true. A reader should be able to explore a substantial body of work and leave with a clear sense of how Lloyd frames problems, handles constraints, rejects alternatives, acts under uncertainty, and learns from outcomes.

The owner is unavailable during implementation and provided no corrections to the proposed defaults. The design therefore adopts the recommended curated hybrid, safe reconstruction, the current restrained voice, local commits, and no push or deployment.

## Goals

- Turn the site into a broad, coherent catalog rather than a small proof of concept.
- Make project cases decision narratives, not repository summaries.
- Spend most of every case on reasoning, choices, actions, feedback, and adaptation.
- Demonstrate the four stated engineering threads with enough depth that the positioning is credible.
- Separate exploratory ideas, defended opinions, practical methods, and project evidence.
- Let visitors discover content through indexes, cross-links, and terminal navigation.
- Keep authoring and validation reliable as the corpus grows.
- Produce reviewable drafts without presenting invented biography as fact.

## Non-goals

- Do not invent named employers, clients, credentials, dates, team sizes, exact metrics, or identifiable incidents.
- Do not present a composite case as a verified historical engagement.
- Do not add unsupported claims of seniority, leadership scope, or commercial impact.
- Do not redesign the terminal garden, add a CMS, introduce a framework, or add server-side behavior.
- Do not add analytics, comments, a newsletter, a conversion funnel, or external publishing automation.
- Do not push, deploy, or otherwise make the new drafts public.

## Editorial Position

### Audience

The primary reader is a technically literate peer, potential collaborator, or hiring decision-maker who cares more about engineering judgment than a tool inventory. The desired conclusion is:

> Lloyd makes constraints and trade-offs explicit, works through uncertainty deliberately, and improves both systems and the reasoning around them.

The site remains label-light. Credibility comes from the quality and consistency of the cases and arguments rather than an invented title or career chronology.

### Voice

The current house voice remains the default:

- first person, calm, precise, and technically literate
- thesis-led rather than autobiographical
- confident about reasoning and modest about certainty
- specific about constraints, alternatives, and failure modes
- skeptical of slogans, résumé language, and absolute rules
- willing to show unfinished thinking honestly
- fond of concise contrasts, but not so often that they become a mannerism

Avoid “passionate,” “thought leader,” “world-class,” “best practice” without context, and inflated claims of transformation. Prefer “I chose,” “I rejected,” “the constraint changed,” “the evidence suggested,” and “I would do differently.”

### Truth and Draft Policy

Content belongs to one of three evidence classes:

1. **Observed:** directly supported by the repository or the implementation being discussed.
2. **Reconstructed:** a plausible first-person account derived from known interests and general engineering experience, with no identifying facts or precise outcome claims.
3. **Composite:** a deliberately blended scenario used to express the decisions and practices Lloyd wants to examine.

Every reconstructed or composite project page must say so near the top. Such pages may include realistic constraints, alternatives, implementation sequences, and qualitative outcomes. They may not include invented organizations, credentials, exact dates, exact metrics, or claims that imply a verifiable employment history.

Ideas, opinions, and playbooks are written directly in Lloyd’s current house voice. They are positions for later review, not claims about past employment.

## Information Architecture

The content tree expands to the following collections:

```text
/
├── README.md
├── about.md
├── now.md
├── uses.md
├── contact.md
├── projects/
├── ideas/
├── opinions/
├── playbooks/
├── interests/
└── topics/
```

### Projects

`projects/` contains long decision narratives. Target: at least twelve leaf documents, including the observed Terminal Garden case and clearly labeled composite or reconstructed cases across backend design, delivery, refactoring, teaching, and AI-assisted engineering.

Each case uses this shape:

1. outcome-oriented summary
2. problem and uncertainty
3. context, stakes, and constraints
4. evidence available at the start
5. alternatives considered and rejected
6. decision and its explicit trade-off
7. actions in sequence
8. feedback, surprises, and course corrections
9. qualitative or observed outcome
10. what remains unresolved
11. what I would do differently
12. principles carried forward

Sections three through eight should occupy most of the document.

### Ideas

`ideas/` contains exploratory essays. Target: at least twenty leaf documents. Each begins from a question or provisional thesis, develops it through an example, tests the strongest objection, names failure modes, and ends with the next question rather than artificial certainty.

### Opinions

`opinions/` contains defended positions. Target: at least sixteen leaf documents. Each states the position early, explains the experience or reasoning behind it, presents the strongest counterargument fairly, defines when the position does not apply, and ends with practical consequences.

### Playbooks

`playbooks/` contains actionable methods. Target: at least twelve leaf documents. Each explains when to use the method, signals that trigger it, the sequence of decisions and actions, common failure modes, and a lightweight artifact or checklist.

### Interests

`interests/` contains four substantial maps for the known threads: backend design, delivery systems, refactoring education, and AI-assisted engineering. These pages explain why the subject remains interesting, the questions Lloyd keeps returning to, and routes into related cases, ideas, opinions, and playbooks. No unsupported nontechnical interests are invented.

### Topics

`topics/` contains cross-cutting navigation hubs rather than duplicate essays. Initial hubs cover boundaries, evidence, feedback loops, change safety, learning, and accountability. Each hub curates related material across collections and explains the connection in a short editorial introduction.

### Root Documents

- `README.md` becomes the editorial front door and offers several reading paths.
- `about.md` explains Lloyd’s working philosophy without inventing a career label.
- `now.md` describes current questions rather than unverifiable employment status.
- `uses.md` describes approaches and tools as preferences, not claims of mastery.
- `contact.md` keeps the existing quiet exits.

## Corpus Target

The first complete catalog contains at least:

- 12 project cases
- 20 idea essays
- 16 opinion essays
- 12 playbooks
- 4 interest maps
- 6 topic hubs
- 5 root documents
- 6 collection indexes

This is a floor of 81 rendered Markdown documents when indexes and hubs are included. Project cases should generally be the longest pieces. Other leaves should be long enough to contain an example, reasoning, a counterargument or failure mode, and a practical consequence; word count is not a substitute for substance.

## Navigation and Content Flow

Every leaf document has:

- exactly one level-one title
- a visible status and evidence-class line
- a clear collection link near the end
- three to six related internal links
- no dead-end navigation

Collection indexes group documents into purposeful reading paths rather than alphabetic walls. The root page offers:

- start with a project
- follow one of the four core interests
- read a defended opinion
- use a practical playbook
- browse the full catalog

Topic hubs provide the cross-collection graph. The terminal remains the primary frame, but its virtual filesystem must expose every Markdown file deterministically.

## Supporting Architecture

The existing static architecture remains intact:

- Markdown files remain the source of truth.
- The browser continues to fetch allowlisted local files.
- The custom renderer remains dependency-free and inert.
- The build still produces a static `dist/`.

Targeted improvements support the larger corpus:

1. Generate the content manifest deterministically from `content/**/*.md` rather than maintaining it by hand.
2. Add validation that every Markdown file is registered, every internal Markdown link resolves, every leaf has one title, and every project contains the required decision sections.
3. Add terminal discovery commands only where they materially help the catalog, such as `tree` and text-based `find`.
4. Preserve all existing safety constraints: no shell execution, no arbitrary filesystem access, and no active content protocols.
5. Keep generated output reproducible and checked by tests.

No metadata framework or CMS is required. Status, evidence class, and navigation remain readable Markdown conventions so the source is understandable without tooling.

## Error Handling and Safety

- Build or validation fails on an unregistered document, broken internal link, duplicate virtual path, missing title, or missing required project section.
- External links remain limited to safe `http`, `https`, and `mailto` protocols.
- Composite content cannot silently lose its evidence label.
- The build must never publish files outside the explicit static asset and content allowlists.
- Content generation scripts must be deterministic and must not require network access.
- No draft is pushed or deployed during this work.

## Verification

Completion requires evidence in four layers:

1. **Corpus audit**
   - minimum document counts are met
   - all four interests have meaningful coverage
   - project pages devote most of their structure to decisions, reasoning, and actions
   - reconstructed and composite projects are labeled

2. **Content integrity**
   - no unresolved internal Markdown links
   - no orphaned leaf documents
   - indexes and related links resolve
   - no unfinished placeholder markers

3. **Technical verification**
   - unit tests pass
   - content validation passes
   - deterministic build passes
   - the resulting `dist/` contains the complete corpus

4. **Reader verification**
   - locally render the site at desktop and mobile sizes
   - open representative documents from every collection
   - exercise terminal navigation and discovery
   - inspect headings, links, scrolling, responsive behavior, and reduced-motion behavior

## Delivery

Work is committed locally in coherent batches:

1. design and implementation plan
2. scalable content registry and validation
3. project cases
4. ideas and opinions
5. playbooks, interests, and topic hubs
6. integration, cross-linking, and final verification

There is no push or deployment. The owner will review, merge, rewrite, or delete artifacts afterward.
