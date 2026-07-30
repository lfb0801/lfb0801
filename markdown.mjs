function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(value) {
  const href = value.trim();
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (/^(\/|\.\/|\.\.\/|#)/.test(href)) return href;
  return null;
}

function renderText(value) {
  let output = escapeHtml(value);

  output = output.replace(/\[([^\]]+)]\(([^)\s]+(?:\)[^)\s]*)?)\)/g, (_, label, target) => {
    const href = safeHref(target);
    if (!href) return label;
    const external = /^https?:/i.test(href);
    const attributes = external ? ' target="_blank" rel="noreferrer"' : "";
    return `<a href="${escapeHtml(href)}"${attributes}>${label}</a>`;
  });
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/_([^_]+)_/g, "<em>$1</em>");
  return output;
}

function renderInline(value) {
  const parts = String(value).split(/(`[^`]*`)/g);
  return parts
    .map((part) =>
      part.startsWith("`") && part.endsWith("`")
        ? `<code>${escapeHtml(part.slice(1, -1))}</code>`
        : renderText(part),
    )
    .join("");
}

export function renderMarkdown(markdown) {
  const lines = String(markdown ?? "").replaceAll("\r\n", "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
    list = [];
  }

  function flushCode() {
    if (!code) return;
    const language = code.language ? ` class="language-${code.language}"` : "";
    blocks.push(`<pre><code${language}>${escapeHtml(code.lines.join("\n"))}</code></pre>`);
    code = null;
  }

  for (const line of lines) {
    const fence = line.match(/^```\s*([a-zA-Z0-9_-]*)\s*$/);
    if (fence) {
      if (code) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
        code = { language: fence[1].toLowerCase(), lines: [] };
      }
      continue;
    }

    if (code) {
      code.lines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push("<hr>");
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushCode();
  return blocks.join("\n");
}
