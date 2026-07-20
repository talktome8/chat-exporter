import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "index.html") {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the product page with accurate launch content", async () => {
  const html = await render();
  assert.match(html, /<title>Chat Exporter by Tom Raz/);
  assert.match(html, /Keep the conversation/);
  assert.match(html, /Chrome/);
  assert.match(html, /Edge/);
  assert.match(html, /Firefox/);
  assert.match(html, /Coming soon to browser stores/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
  assert.doesNotMatch(html, /Grok and Mistral remain clearly marked beta/);
});

test("exports the public privacy policy", async () => {
  const html = await render("privacy.html");
  assert.match(html, /Privacy Policy/);
  assert.match(html, /does not make network requests/);
  assert.match(html, /מדיניות פרטיות/);
});
