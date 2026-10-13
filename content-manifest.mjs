import { GITHUB_PROJECT_ENTRIES } from "./github-projects.mjs";

export const CONTENT_ENTRIES = [
  { path: "/", type: "directory" },
  { path: "/README.md", type: "file", source: "./content/README.md" },
  { path: "/about.md", type: "file", source: "./content/about.md" },
  { path: "/contact.md", type: "file", source: "./content/contact.md" },
  { path: "/ideas", type: "directory" },
  { path: "/ideas/README.md", type: "file", source: "./content/ideas/README.md" },
  {
    path: "/ideas/making-engineering-reasoning-visible.md",
    type: "file",
    source: "./content/ideas/making-engineering-reasoning-visible.md",
  },
  { path: "/projects", type: "directory" },
  ...GITHUB_PROJECT_ENTRIES,
];

export const CONTENT_BY_PATH = new Map(
  CONTENT_ENTRIES.map((entry) => [entry.path, entry]),
);
