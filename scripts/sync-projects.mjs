import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { githubClient, allPages } from "./github-api.mjs";
import { OWNER, SITE_REPOSITORY, publicProjects, projectChanges, catalogModule } from "./project-catalog.mjs";
import { PROJECT_REPOSITORIES } from "../github-projects.mjs";

export async function synchronizeProjects({ request, previous, readNotes, writeCatalog, notifyRemovals = false }) {
const repositories = publicProjects(await allPages(request, `/users/${OWNER}/repos?type=owner&sort=full_name`));
const projects = [];
for (const repo of repositories) {
  const readme = await request(`/repos/${repo.full_name}/readme`, { allow404: true });
  const notes = await readNotes(repo.name);
  projects.push({ repo, readme, notes });
}

const changes = projectChanges(previous, repositories.map(repo => repo.full_name));
// No catalog is replaced unless the complete GitHub read succeeds.
const output = catalogModule(projects);
if (changes.removed.length && notifyRemovals) {
  const issues = await allPages(request, `/repos/${SITE_REPOSITORY}/issues?state=open`);
  for (const fullName of changes.removed) {
    const marker = `<!-- project-unindexed: ${fullName} -->`;
    if (issues.some(issue => !issue.pull_request && issue.body?.includes(marker))) continue;
    await request(`/repos/${SITE_REPOSITORY}/issues`, {
      method: "POST",
      body: {
        title: `Project removed from public catalog: ${fullName.split("/")[1]}`,
        body: `${marker}\n\nThis repository is no longer in the account's public repository list. The next site deployment removes its project page automatically.\n\nAny additional notes are retained in version control. If the repository becomes public again, synchronization will add it back.`,
      },
    });
  }
}
await writeCatalog(output);
return { count: projects.length, ...changes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await synchronizeProjects({
    request: githubClient(process.env.GH_TOKEN),
    previous: PROJECT_REPOSITORIES,
    readNotes: async name => {
      try { return await readFile(new URL(`../content/project-notes/${name}.md`, import.meta.url), "utf8"); }
      catch (error) { if (error.code !== "ENOENT") throw error; return ""; }
    },
    writeCatalog: output => writeFile(new URL("../github-projects.mjs", import.meta.url), output),
    notifyRemovals: process.env.CREATE_REMOVAL_ISSUES === "true",
  });
  console.log(`Synchronized ${result.count} public projects; ${result.added.length} added, ${result.removed.length} removed.`);
}
