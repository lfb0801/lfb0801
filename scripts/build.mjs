import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_ENTRIES } from "../content-manifest.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const destination = join(root, "dist");

const publicFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "content-manifest.mjs",
  "github-projects.mjs",
  "markdown.mjs",
  "terminal-core.mjs",
];

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

for (const file of publicFiles) {
  await cp(join(root, file), join(destination, file));
}

// Publish only registered documents; unindexed project notes stay out of dist/.
for (const entry of CONTENT_ENTRIES.filter(entry => entry.source)) {
  const target = join(destination, entry.source);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, entry.source), target);
}
await cp(join(root, "public", "og.png"), join(destination, "og.png"));
await writeFile(join(destination, ".nojekyll"), "");

console.log(`Built ${publicFiles.length + 1} assets and the Markdown content into dist/.`);
