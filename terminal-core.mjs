const COMMANDS = ["help", "ls", "cd", "pwd", "show", "cat", "whoami", "clear", "clean"];

const HELP_LINES = [
  "help              show this command guide",
  "ls [path]         list files",
  "cd [path]         change directory",
  "pwd               print current directory",
  "show <file>       render a Markdown file",
  "cat <file>        alias for show",
  "whoami            a short introduction",
  "clear             clear terminal output",
  "clean             reset and reopen README.md",
];

function displayPath(path) {
  return path === "/" ? "~" : `~${path}`;
}

function basename(path) {
  return path === "/" ? "/" : path.slice(path.lastIndexOf("/") + 1);
}

function dirname(path) {
  if (path === "/") return "/";
  const parent = path.slice(0, path.lastIndexOf("/"));
  return parent || "/";
}

function hasSandboxSyntax(input) {
  return /&&|\|\||[;|<>`]|\$\(/.test(input);
}

function parseTokens(input) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (const character of input.trim()) {
    if (quote) {
      if (character === quote) {
        quote = null;
      } else {
        current += character;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (/\s/.test(character)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += character;
    }
  }

  if (current) tokens.push(current);
  return tokens;
}

function resolvePath(rawPath, cwd) {
  const input = rawPath || ".";
  const fromRoot = input === "~" || input.startsWith("~/") || input.startsWith("/");
  const base = fromRoot ? [] : cwd.split("/").filter(Boolean);
  const source = input === "~" ? "" : input.replace(/^~\//, "").replace(/^\//, "");

  for (const segment of source.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (base.length === 0) {
        return { error: "path cannot leave the virtual garden" };
      }
      base.pop();
      continue;
    }
    base.push(segment);
  }

  return { path: `/${base.join("/")}`.replace(/\/$/, "") || "/" };
}

function directChildren(entries, directory) {
  return entries
    .filter((entry) => entry.path !== directory && dirname(entry.path) === directory)
    .sort((left, right) => {
      if (left.type !== right.type) return left.type === "directory" ? -1 : 1;
      if (basename(left.path).toLowerCase() === "readme.md") return -1;
      if (basename(right.path).toLowerCase() === "readme.md") return 1;
      return basename(left.path).localeCompare(basename(right.path));
    });
}

function action(kind, cwd, lines = [], extra = {}) {
  return { kind, lines, cwd, ...extra };
}

export function createTerminalEngine({ entries, initialPath = "/" }) {
  const entryMap = new Map(entries.map((entry) => [entry.path, entry]));
  let cwd = entryMap.get(initialPath)?.type === "directory" ? initialPath : "/";

  function resolveKnown(rawPath) {
    const resolved = resolvePath(rawPath, cwd);
    if (resolved.error) return resolved;
    return { ...resolved, entry: entryMap.get(resolved.path) };
  }

  function execute(input) {
    const commandLine = String(input ?? "").trim();
    if (!commandLine) return action("empty", cwd);

    if (hasSandboxSyntax(commandLine)) {
      return action("error", cwd, ["sandbox syntax disabled: commands cannot be chained or redirected"]);
    }

    const [command, ...args] = parseTokens(commandLine);
    const target = args.join(" ");

    if (command === "help") return action("output", cwd, HELP_LINES);
    if (command === "pwd") return action("output", cwd, [displayPath(cwd)]);
    if (command === "whoami") {
      return action("output", cwd, [
        "Lloyd van Zaalen",
        "software engineer exploring how code, delivery systems, and AI expose engineering reasoning",
      ]);
    }
    if (command === "clear") return action("action", cwd, [], { clear: true });
    if (command === "clean") {
      cwd = initialPath;
      return action("action", cwd, [], { clear: true, replay: true });
    }

    if (command === "cd") {
      const resolved = resolveKnown(target || initialPath);
      if (resolved.error) return action("error", cwd, [resolved.error]);
      if (!resolved.entry) return action("error", cwd, [`directory not found: ${target}`]);
      if (resolved.entry.type !== "directory") {
        return action("error", cwd, [`not a directory: ${target}`]);
      }
      cwd = resolved.path;
      return action("output", cwd);
    }

    if (command === "ls") {
      const resolved = resolveKnown(target || cwd);
      if (resolved.error) return action("error", cwd, [resolved.error]);
      if (!resolved.entry) return action("error", cwd, [`path not found: ${target}`]);
      const items =
        resolved.entry.type === "directory"
          ? directChildren(entries, resolved.path)
          : [resolved.entry];
      const lines = items.map((entry) =>
        entry.type === "directory"
          ? `󰉋  ${basename(entry.path)}/`
          : `󰈙  ${basename(entry.path)}`,
      );
      return action("output", cwd, lines);
    }

    if (command === "show" || command === "cat") {
      if (!target) return action("error", cwd, [`usage: ${command} <file>`]);
      const resolved = resolveKnown(target);
      if (resolved.error) return action("error", cwd, [resolved.error]);
      if (!resolved.entry) return action("error", cwd, [`file not found: ${target}`]);
      if (resolved.entry.type !== "file" || !resolved.path.toLowerCase().endsWith(".md")) {
        return action("error", cwd, [`not a Markdown file: ${target}`]);
      }
      return action("output", cwd, [`opening ${displayPath(resolved.path)}`], {
        openPath: resolved.path,
      });
    }

    return action("error", cwd, [
      `command not found: ${command}`,
      "type `help` to see what this garden understands",
    ]);
  }

  function complete(input) {
    const source = String(input ?? "");
    if (!source.includes(" ")) {
      const matches = COMMANDS.filter((command) => command.startsWith(source));
      return matches.length === 1 ? `${matches[0]} ` : source;
    }

    const separator = source.indexOf(" ");
    const command = source.slice(0, separator);
    const partial = source.slice(separator + 1);
    if (!["cd", "ls", "show", "cat"].includes(command)) return source;

    const partialDirectory = partial.includes("/") ? partial.slice(0, partial.lastIndexOf("/") + 1) : "";
    const partialName = partial.slice(partialDirectory.length);
    const resolvedDirectory = resolvePath(partialDirectory || ".", cwd);
    if (resolvedDirectory.error) return source;

    const matches = directChildren(entries, resolvedDirectory.path).filter((entry) => {
      if (command === "cd" && entry.type !== "directory") return false;
      if ((command === "show" || command === "cat") && entry.type !== "file") return false;
      return basename(entry.path).startsWith(partialName);
    });

    if (matches.length !== 1) return source;
    const match = matches[0];
    const suffix = match.type === "directory" ? "/" : "";
    return `${command} ${partialDirectory}${basename(match.path)}${suffix}`;
  }

  return { execute, complete };
}
