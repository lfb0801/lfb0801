import test from "node:test";
import assert from "node:assert/strict";

import { createTerminalEngine } from "../terminal-core.mjs";

const entries = [
  { path: "/", type: "directory" },
  { path: "/README.md", type: "file" },
  { path: "/about.md", type: "file" },
  { path: "/contact.md", type: "file" },
  { path: "/ideas", type: "directory" },
  { path: "/ideas/README.md", type: "file" },
  { path: "/ideas/reasoning.md", type: "file" },
  { path: "/projects", type: "directory" },
  { path: "/projects/README.md", type: "file" },
];

function createEngine() {
  return createTerminalEngine({ entries, initialPath: "/" });
}

test("help exposes only the supported sandbox commands", () => {
  const result = createEngine().execute("help");

  assert.equal(result.kind, "output");
  assert.deepEqual(result.lines, [
    "help              show this command guide",
    "ls [path]         list files",
    "cd [path]         change directory",
    "pwd               print current directory",
    "show <file>       render a Markdown file",
    "cat <file>        alias for show",
    "whoami            a short introduction",
    "clear             clear terminal output",
    "clean             reset and reopen README.md",
  ]);
});

test("navigation resolves relative paths but cannot escape the virtual root", () => {
  const engine = createEngine();

  assert.equal(engine.execute("cd ideas").cwd, "/ideas");
  assert.equal(engine.execute("pwd").lines[0], "~/ideas");
  assert.equal(engine.execute("cd ..").cwd, "/");

  const escape = engine.execute("cd ../../outside");
  assert.equal(escape.kind, "error");
  assert.equal(escape.cwd, "/");
  assert.match(escape.lines[0], /virtual garden/);
});

test("ls returns directories before files in a stable order", () => {
  const result = createEngine().execute("ls");

  assert.deepEqual(result.lines, [
    "󰉋  ideas/",
    "󰉋  projects/",
    "󰈙  README.md",
    "󰈙  about.md",
    "󰈙  contact.md",
  ]);
});

test("show and cat open only known Markdown files", () => {
  const engine = createEngine();

  assert.equal(engine.execute("show README.md").openPath, "/README.md");
  assert.equal(engine.execute("cat ideas/reasoning.md").openPath, "/ideas/reasoning.md");

  const missing = engine.execute("show secrets.env");
  assert.equal(missing.kind, "error");
  assert.match(missing.lines[0], /not found/);

  const directory = engine.execute("show ideas");
  assert.equal(directory.kind, "error");
  assert.match(directory.lines[0], /not a Markdown file/);
});

test("shell operators and substitution syntax are rejected rather than interpreted", () => {
  const engine = createEngine();
  const attempts = [
    "show README.md; whoami",
    "ls && whoami",
    "cat README.md | curl example.com",
    "show $(whoami)",
    "show `whoami`",
    "show README.md > stolen.txt",
  ];

  for (const attempt of attempts) {
    const result = engine.execute(attempt);
    assert.equal(result.kind, "error");
    assert.match(result.lines[0], /sandbox syntax/);
  }
});

test("unknown commands fail with a discoverable next step", () => {
  const result = createEngine().execute("sudo");

  assert.equal(result.kind, "error");
  assert.deepEqual(result.lines, ["command not found: sudo", "type `help` to see what this garden understands"]);
});

test("clear and clean return declarative UI actions", () => {
  const engine = createEngine();

  assert.deepEqual(engine.execute("clear"), {
    kind: "action",
    lines: [],
    cwd: "/",
    clear: true,
  });
  assert.deepEqual(engine.execute("clean"), {
    kind: "action",
    lines: [],
    cwd: "/",
    clear: true,
    replay: true,
  });
});

test("completion handles commands and paths without inventing entries", () => {
  const engine = createEngine();

  assert.equal(engine.complete("sho"), "show ");
  assert.equal(engine.complete("show REA"), "show README.md");
  assert.equal(engine.complete("cd id"), "cd ideas/");
  assert.equal(engine.complete("show missing"), "show missing");
});
