import { CONTENT_BY_PATH, CONTENT_ENTRIES } from "./content-manifest.mjs";
import { renderMarkdown } from "./markdown.mjs";
import { createTerminalEngine } from "./terminal-core.mjs";

const workspace = document.querySelector("#workspace");
const terminal = document.querySelector("#terminal");
const output = document.querySelector("#terminal-output");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command-input");
const promptPath = document.querySelector("#prompt-path");
const reader = document.querySelector("#reader");
const readerPath = document.querySelector("#reader-path");
const documentView = document.querySelector("#document");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const engine = createTerminalEngine({
  entries: CONTENT_ENTRIES,
  initialPath: "/",
});

const commandHistory = [];
let historyIndex = 0;
let currentDocumentPath = null;
let currentCwd = "/";
let sequenceRunning = false;

function toDisplayPath(path) {
  return path === "/" ? "~" : `~${path}`;
}

function appendLine(text = "", tone = "") {
  const line = document.createElement("div");
  line.className = `terminal-line ${tone}`.trim();
  line.textContent = text;
  output.append(line);
  output.scrollTop = output.scrollHeight;
}

function appendCommand(command, cwd) {
  const line = document.createElement("div");
  line.className = "terminal-line command";

  const prompt = document.createElement("span");
  prompt.className = "line-prompt";
  prompt.textContent = `lloyd@garden:${toDisplayPath(cwd)} ❯`;

  const value = document.createElement("span");
  value.textContent = command;

  line.append(prompt, value);
  output.append(line);
}

function updatePrompt(cwd) {
  currentCwd = cwd;
  promptPath.textContent = toDisplayPath(cwd);
}

function setReaderVisible(visible) {
  workspace.classList.toggle("reader-visible", visible);
  reader.classList.toggle("visible", visible);
  reader.setAttribute("aria-hidden", String(!visible));
}

function virtualLinkPath(href) {
  if (href.startsWith("/")) return href;
  const base = currentDocumentPath?.slice(0, currentDocumentPath.lastIndexOf("/") + 1) || "/";
  const parts = `${base}${href}`.split("/");
  const resolved = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") resolved.pop();
    else resolved.push(part);
  }

  return `/${resolved.join("/")}`;
}

async function openDocument(path) {
  const entry = CONTENT_BY_PATH.get(path);
  if (!entry?.source) {
    appendLine(`reader error: ${path} is not in the garden manifest`, "error");
    return;
  }

  try {
    const response = await fetch(entry.source);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();

    currentDocumentPath = path;
    readerPath.textContent = toDisplayPath(path);
    documentView.innerHTML = renderMarkdown(markdown);
    documentView.scrollTop = 0;
    setReaderVisible(true);

    const hash = `#file=${encodeURIComponent(path)}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
  } catch {
    appendLine(`reader error: could not load ${toDisplayPath(path)}`, "error");
  }
}

async function runCommand(command, { echo = true } = {}) {
  if (echo) appendCommand(command, currentCwd);

  const result = engine.execute(command);
  updatePrompt(result.cwd);

  if (result.clear) output.replaceChildren();
  for (const line of result.lines) {
    appendLine(line, result.kind === "error" ? "error" : "");
  }

  if (result.openPath) await openDocument(result.openPath);
  if (result.replay) {
    setReaderVisible(false);
    documentView.replaceChildren();
    await playOpeningSequence("/README.md");
  }

  output.scrollTop = output.scrollHeight;
  return result;
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function typeCommand(command) {
  input.value = "";
  if (reducedMotion) {
    input.value = command;
  } else {
    for (const character of command) {
      input.value += character;
      await delay(34 + Math.random() * 38);
    }
    await delay(180);
  }

  input.value = "";
  await runCommand(command);
}

async function playOpeningSequence(path) {
  if (sequenceRunning) return;
  sequenceRunning = true;
  input.readOnly = true;

  appendLine("LLOYD/OS 0.1 — personal knowledge environment", "system");
  appendLine(`mounting ${CONTENT_ENTRIES.filter((entry) => entry.type === "file").length} garden files…`, "system");
  appendLine("capabilities: read-only · allowlisted · local", "success");
  appendLine();

  if (!reducedMotion) await delay(360);
  await typeCommand(`show ${path.replace(/^\//, "")}`);

  input.readOnly = false;
  input.focus({ preventScroll: true });
  sequenceRunning = false;
}

function requestedInitialPath() {
  const match = window.location.hash.match(/^#file=(.+)$/);
  if (!match) return "/README.md";

  try {
    const path = decodeURIComponent(match[1]);
    return CONTENT_BY_PATH.get(path)?.type === "file" ? path : "/README.md";
  } catch {
    return "/README.md";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sequenceRunning) return;

  const command = input.value.trim();
  input.value = "";
  if (!command) return;

  commandHistory.push(command);
  historyIndex = commandHistory.length;
  await runCommand(command);
});

input.addEventListener("keydown", (event) => {
  if (sequenceRunning) return;

  if (event.key === "Tab") {
    event.preventDefault();
    input.value = engine.complete(input.value);
    input.setSelectionRange(input.value.length, input.value.length);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex > 0) historyIndex -= 1;
    input.value = commandHistory[historyIndex] || "";
    input.setSelectionRange(input.value.length, input.value.length);
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex < commandHistory.length) historyIndex += 1;
    input.value = commandHistory[historyIndex] || "";
    input.setSelectionRange(input.value.length, input.value.length);
  }

  if (event.key.toLowerCase() === "l" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    runCommand("clear", { echo: false });
  }
});

terminal.addEventListener("pointerdown", (event) => {
  if (event.target.closest("input, a, button")) return;
  input.focus({ preventScroll: true });
});

documentView.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href?.toLowerCase().endsWith(".md")) return;

  event.preventDefault();
  const path = virtualLinkPath(href);
  runCommand(`show ${path}`);
});

playOpeningSequence(requestedInitialPath());
