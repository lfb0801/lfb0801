# Terminal Garden POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free, GitHub Pages-ready portfolio POC that behaves like a safe terminal and renders a real Markdown-based digital garden.

**Architecture:** A static HTML shell owns presentation and browser interaction. A small pure JavaScript command engine accepts only an explicit allowlist and returns declarative actions; the browser controller performs those actions against a fixed virtual filesystem manifest. Real Markdown files live under `content/` and are rendered in the document pane.

**Tech Stack:** Semantic HTML, modern CSS, browser-native ES modules, Node.js built-in test runner, GitHub Pages Actions.

## Global Constraints

- The root `README.md` is the GitHub profile homepage; `content/README.md` is the website landing document.
- No command may invoke a shell, evaluate code, access arbitrary URLs, or read outside the fixed content manifest.
- The initial experience types `show README.md` and opens the document pane.
- The interface must remain usable with a keyboard, on small screens, and with reduced motion.
- The site must build into a self-contained `dist/` directory suitable for GitHub Pages.
- Content is an honest starter set, not a fabricated project history.

---

### Task 1: Safe command engine

**Files:**
- Create: `tests/terminal-core.test.mjs`
- Create: `terminal-core.mjs`

**Interfaces:**
- Produces: `createTerminalEngine({ entries, initialPath })`
- Produces: `engine.execute(input)` returning `{ kind, lines, cwd, openPath?, clear? }`
- Produces: `engine.complete(input)` returning a deterministic completion string

- [ ] **Step 1: Write failing tests**

Cover the welcome command set, path traversal inside the manifest, unknown commands, attempts to use shell operators, `show`/`cat`, `clear`/`clean`, and tab completion.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/terminal-core.test.mjs`

Expected: failure because `terminal-core.js` does not exist.

- [ ] **Step 3: Implement the minimal allowlisted engine**

Keep parsing and path resolution pure. Return actions instead of touching the DOM, network, filesystem, or browser APIs.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test tests/terminal-core.test.mjs`

Expected: all tests pass.

### Task 2: Terminal garden interface

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`
- Create: `content-manifest.mjs`
- Create: `content/README.md`
- Create: `content/about.md`
- Create: `content/contact.md`
- Create: `content/ideas/README.md`
- Create: `content/ideas/making-engineering-reasoning-visible.md`
- Create: `content/projects/README.md`

**Interfaces:**
- Consumes: `createTerminalEngine`
- Consumes: `CONTENT_ENTRIES`
- Produces: a single-page terminal with a Markdown document pane

- [ ] **Step 1: Build the semantic shell and visual system**

Use a restrained dark palette, a bright green prompt, warm document surface, Nerd Font-compatible glyphs with reliable fallbacks, and a strong split-pane composition.

- [ ] **Step 2: Wire the interaction controller**

Support Enter, history with ArrowUp/ArrowDown, Tab completion, safe Markdown fetching, hash-deep-links, and the automatic `show README.md` sequence.

- [ ] **Step 3: Add responsive and accessibility behavior**

Stack the reader below the terminal on narrow screens, expose command output to assistive technology, preserve focus, provide a motion-free opening path, and keep touch targets usable.

- [ ] **Step 4: Add the starter garden**

Introduce Lloyd, explain the garden, expose the four connected engineering themes, include discoverable contact details, and clearly mark project content as an evolving collection.

### Task 3: GitHub profile and Pages delivery

**Files:**
- Replace: `README.md`
- Create: `package.json`
- Create: `scripts/build.mjs`
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Produces: `npm test`
- Produces: `npm run build`
- Produces: `dist/` containing only deployable static assets

- [ ] **Step 1: Replace the obsolete profile README**

Create a concise GitHub-native introduction that points toward the terminal garden without duplicating its content.

- [ ] **Step 2: Add a deterministic static build**

Copy the exact public asset allowlist into a clean `dist/` directory and add `.nojekyll`.

- [ ] **Step 3: Add GitHub Pages deployment**

Build and test on pushes to the default branch, then publish `dist/` through the official Pages actions.

- [ ] **Step 4: Verify the complete deliverable**

Run: `npm test`

Run: `npm run build`

Inspect `dist/`, validate the working tree diff, and confirm no legacy GraphQL Playground assets remain.
