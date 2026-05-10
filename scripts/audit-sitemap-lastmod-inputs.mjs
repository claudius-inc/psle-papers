import { readFileSync } from "node:fs";

const source = readFileSync("scripts/generate-sitemap.mjs", "utf8");

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const requiredInputs = [
  "scripts/ensure-snippet-focused-ui.mjs",
  "scripts/ensure-viewer-school-seo.mjs",
  "scripts/generate-sitemap.mjs",
  "app/pages/index.vue",
  "app/pages/view/[id].vue",
  "app/pages/exam-papers/[[slug]].vue",
  "app/utils/paperSeo.ts",
  "public/json/files.json",
  "public/json/dropdownOptions.json",
];

for (const input of requiredInputs) {
  if (!source.includes(`"${input}"`)) {
    fail(`Sitemap lastmod inputs are missing ${input}.`);
  }
}

for (const snippet of [
  "const sitemapFreshnessInputs = [",
  "const staticFreshnessInputs = [",
  "...sitemapFreshnessInputs",
  "staticFreshnessInputs",
]) {
  if (!source.includes(snippet)) {
    fail(`Sitemap lastmod implementation is missing expected snippet: ${snippet}`);
  }
}

if (process.exitCode) process.exit();
console.log("Sitemap lastmod input audit passed.");
