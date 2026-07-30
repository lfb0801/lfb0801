import test from "node:test";
import assert from "node:assert/strict";

import { renderMarkdown } from "../markdown.mjs";

test("renders the garden's headings, paragraphs, lists, links, and inline code", () => {
  const html = renderMarkdown(`# Garden

An [external link](https://example.com) and \`show README.md\`.

- first
- second`);

  assert.match(html, /<h1>Garden<\/h1>/);
  assert.match(html, /<p>An <a href="https:\/\/example\.com"/);
  assert.match(html, /<code>show README\.md<\/code>/);
  assert.match(html, /<ul><li>first<\/li><li>second<\/li><\/ul>/);
});

test("escapes raw HTML and rejects active link protocols", () => {
  const html = renderMarkdown(`<script>alert("nope")</script>

[unsafe](javascript:alert(1))`);

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /href="javascript:/);
});

test("renders fenced code as inert escaped content", () => {
  const html = renderMarkdown("```js\nconst value = '<tag>';\n```");

  assert.match(html, /<pre><code class="language-js">/);
  assert.match(html, /&lt;tag&gt;/);
  assert.doesNotMatch(html, /<tag>/);
});
