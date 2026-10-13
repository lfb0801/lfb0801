import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { githubClient } from "./github-api.mjs";
import { OWNER, SITE_REPOSITORY } from "./project-catalog.mjs";

export function parseProjectNotes(issue) {
  if (issue.state !== "open" || !issue.title?.startsWith("Project notes:") ||
    !["OWNER", "MEMBER", "COLLABORATOR"].includes(issue.author_association)) return null;
  const match = issue.body?.match(/^### Project\s*\n+([^\n]+)\s*\n+### Additional content\s*\n+([\s\S]+)$/m);
  if (!match) throw new Error("Use the Add project notes issue form.");
  const name = match[1].trim();
  const notes = match[2].trim();
  if (!/^[a-zA-Z0-9_.-]+$/.test(name) || [".", ".."].includes(name)) throw new Error("Invalid project name.");
  if (!notes || notes === "_No response_") throw new Error("Additional content is required.");
  return { name, notes: notes + "\n" };
}

export async function proposeProjectNotes(issue, request) {
  const parsed = parseProjectNotes(issue);
  if (!parsed) return null;
  const { name, notes } = parsed;
  const project = await request(`/repos/${OWNER}/${name}`);
  if (project.private !== false || project.owner?.login?.toLowerCase() !== OWNER) {
    throw new Error("Project notes can only be added to a public project owned by the account.");
  }
  const site = await request(`/repos/${SITE_REPOSITORY}`);
  const base = site.default_branch;
  const branch = `project-notes/issue-${issue.number}`;
  const refPath = `/repos/${SITE_REPOSITORY}/git/ref/heads/${branch}`;
  if (!await request(refPath, { allow404: true })) {
    const head = await request(`/repos/${SITE_REPOSITORY}/git/ref/heads/${base}`);
    await request(`/repos/${SITE_REPOSITORY}/git/refs`, {
      method: "POST", body: { ref: `refs/heads/${branch}`, sha: head.object.sha },
    });
  }
  const path = `content/project-notes/${name}.md`;
  const existing = await request(`/repos/${SITE_REPOSITORY}/contents/${path}?ref=${encodeURIComponent(branch)}`, { allow404: true });
  if (!existing || Buffer.from(existing.content, "base64").toString("utf8") !== notes) {
    await request(`/repos/${SITE_REPOSITORY}/contents/${path}`, {
      method: "PUT",
      body: { message: `Add project notes for ${name}`, content: Buffer.from(notes).toString("base64"),
        branch, ...(existing ? { sha: existing.sha } : {}) },
    });
  }
  const pulls = await request(`/repos/${SITE_REPOSITORY}/pulls?state=all&head=${encodeURIComponent(`${OWNER}:${branch}`)}&base=${encodeURIComponent(base)}`);
  const open = pulls.find(pr => pr.state === "open");
  if (open) return open;
  const baseFile = await request(`/repos/${SITE_REPOSITORY}/contents/${path}?ref=${encodeURIComponent(base)}`, { allow404: true });
  if (baseFile && Buffer.from(baseFile.content, "base64").toString("utf8") === notes) return null;
  return request(`/repos/${SITE_REPOSITORY}/pulls`, {
    method: "POST",
    body: { title: `Add project notes for ${name}`, head: branch, base,
      body: `Adds the additional Markdown submitted in #${issue.number} alongside this project's GitHub README. Merging publishes the notes after synchronization.\n\nCloses #${issue.number}` },
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  const result = await proposeProjectNotes(event.issue, githubClient(process.env.GH_TOKEN));
  console.log(result ? `Project notes PR: ${result.html_url}` : "No project notes change required.");
}
