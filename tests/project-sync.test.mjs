import test from "node:test";
import assert from "node:assert/strict";
import { allPages, githubClient } from "../scripts/github-api.mjs";
import { publicProjects, catalogEntries, readmeMarkdown } from "../scripts/project-catalog.mjs";
import { synchronizeProjects } from "../scripts/sync-projects.mjs";
import { parseProjectNotes, proposeProjectNotes } from "../scripts/propose-project-notes.mjs";

function repo(name, extra = {}) {
  return { name, full_name: `lfb0801/${name}`, private: false, owner: { login: "lfb0801" },
    html_url: `https://github.com/lfb0801/${name}`, default_branch: "master", ...extra };
}

test("catalog includes all owned public repositories, including forks, and rejects incomplete metadata", () => {
  const projects = publicProjects([repo("z"), repo("a", { fork: true }), repo("private", { private: true }),
    repo("foreign", { owner: { login: "elsewhere" } })]);
  assert.deepEqual(projects.map(r => r.name), ["a", "z"]);
  assert.throws(() => publicProjects([{}]), /Incomplete/);
});

test("pagination includes projects beyond the first page", async () => {
  const paths = [];
  const all = await allPages(async path => {
    paths.push(path);
    return paths.length === 1 ? Array.from({ length: 100 }, (_, i) => i) : [100];
  }, "/users/lfb0801/repos?type=owner");
  assert.equal(all.length, 101);
  assert.match(paths[1], /&per_page=100&page=2$/);
});

test("README links resolve on GitHub, code stays intact, and notes have an issue action", () => {
  const text = "[Guide](docs/guide.md)\n\n```md\n[example](local.md)\n```";
  const readme = { encoding: "base64", content: Buffer.from(text).toString("base64") };
  const markdown = readmeMarkdown(readme, repo("demo"));
  assert.match(markdown, /https:\/\/github.com\/lfb0801\/demo\/blob\/master\/docs\/guide.md/);
  assert.match(markdown, /\[example\]\(local.md\)/);
  const entries = catalogEntries([{ repo: repo("demo"), readme, notes: "My actual decisions." }]);
  assert.match(entries[2].markdown, /My actual decisions/);
  assert.match(entries[2].markdown, /template=project-notes.yml/);
  assert.match(entries[0].markdown, /\/projects\/github\/demo.md/);
});

test("GitHub failures never overwrite the last successful catalog", async () => {
  let written = false;
  await assert.rejects(synchronizeProjects({
    request: async path => { if (path.includes("/users/")) return [repo("demo")]; throw new Error("rate limit"); },
    previous: ["lfb0801/old"], readNotes: async () => "", writeCatalog: async () => { written = true; },
  }), /rate limit/);
  assert.equal(written, false);
  await assert.rejects(githubClient("test", async () => ({ ok: false, status: 403 }))("/users/lfb0801/repos"), /HTTP 403/);
});

test("removal excludes the old project and its notes and opens one notice", async () => {
  const posted = [];
  let output;
  const options = {
    previous: ["lfb0801/removed"], readNotes: async () => "", notifyRemovals: true,
    writeCatalog: async value => { output = value; },
    request: async (path, options) => {
      if (path.includes("/users/")) return [repo("current")];
      if (path.endsWith("/readme")) return null;
      if (options?.method === "POST") { posted.push(options.body); return {}; }
      return posted;
    },
  };
  const result = await synchronizeProjects(options);
  assert.deepEqual(result.removed, ["lfb0801/removed"]);
  assert.doesNotMatch(output, /removed/);
  assert.equal(posted.length, 1);
  await synchronizeProjects(options);
  assert.equal(posted.length, 1);
});

function issue(extra = {}) {
  return { number: 42, state: "open", author_association: "OWNER", title: "Project notes: demo",
    body: "### Project\n\ndemo\n\n### Additional content\n\nWhy I made this choice.", ...extra };
}

test("notes issues require a trusted author and reject unsafe project paths", () => {
  assert.equal(parseProjectNotes(issue({ author_association: "NONE" })), null);
  assert.throws(() => parseProjectNotes(issue({ body: "### Project\n\n../secret\n\n### Additional content\n\nText" })), /Invalid project/);
  assert.equal(parseProjectNotes(issue()).notes, "Why I made this choice.\n");
});

test("notes create a branch and PR, and repeat edits update the existing PR", async () => {
  const mutations = [];
  let existing = false;
  const request = async (path, options) => {
    if (options?.method) { mutations.push({ path, ...options }); return { html_url: "https://github.com/lfb0801/lfb0801/pull/1" }; }
    if (path === "/repos/lfb0801/demo") return repo("demo");
    if (path === "/repos/lfb0801/lfb0801") return repo("lfb0801");
    if (path.endsWith("/heads/master")) return { object: { sha: "base" } };
    if (path.includes("/git/ref/")) return existing ? { object: { sha: "head" } } : null;
    if (path.includes("/contents/")) return existing ? { sha: "blob", content: Buffer.from("Earlier notes").toString("base64") } : null;
    if (path.includes("/pulls?")) return existing ? [{ state: "open", html_url: "existing" }] : [];
    throw new Error(path);
  };
  await proposeProjectNotes(issue(), request);
  assert.equal(mutations.length, 3);
  assert.equal(mutations[1].body.branch, "project-notes/issue-42");
  assert.match(mutations[2].body.body, /Closes #42/);
  existing = true;
  mutations.length = 0;
  const result = await proposeProjectNotes(issue(), request);
  assert.equal(result.html_url, "existing");
  assert.equal(mutations.length, 1);
  assert.equal(mutations[0].body.sha, "blob");
});
