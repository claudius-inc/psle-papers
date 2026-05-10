import { readFileSync } from "node:fs";

const canonicalHost = "sgexamhub.com";
const canonicalUrl = `https://${canonicalHost}`;
const staleHosts = ["primaryschoolpapers.sg", "primaryschoolpapers.com"];

const files = [
  "public/CNAME",
  "public/robots.txt",
  "scripts/generate-sitemap.mjs",
  "scripts/audit-seo-output.mjs",
  "scripts/audit-live-seo.mjs",
  "scripts/audit-live-top-school-funnel.mjs",
  "scripts/audit-live-free-exam-funnel.mjs",
  "scripts/audit-live-broad-landing-funnels.mjs",
  "scripts/audit-live-sitemap-priority-schools.mjs",
  "app/utils/socialSeo.ts",
  "app/pages/index.vue",
  "app/pages/download-exam-papers.vue",
  "app/pages/free-exam-papers.vue",
  "app/pages/past-year-exam-papers.vue",
  "app/pages/test-papers.vue",
  "app/pages/top-school-exam-papers.vue",
  "app/pages/sitemap.vue",
  "app/pages/exam-papers/2026-revision.vue",
  "app/pages/exam-papers/psle-revision.vue",
  "app/pages/exam-papers/[[slug]].vue",
  "app/pages/view/[id].vue",
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const contents = new Map(files.map((file) => [file, readFileSync(file, "utf8")])) ;

if (contents.get("public/CNAME")?.trim() !== canonicalHost) {
  fail(`public/CNAME must contain ${canonicalHost}.`);
}

const requiredCanonicalSnippets = [
  ["public/robots.txt", `Sitemap: ${canonicalUrl}/sitemap.xml`],
  ["scripts/generate-sitemap.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["scripts/audit-seo-output.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["scripts/audit-live-seo.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["scripts/audit-live-top-school-funnel.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["scripts/audit-live-free-exam-funnel.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["scripts/audit-live-broad-landing-funnels.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["scripts/audit-live-sitemap-priority-schools.mjs", `const siteUrl = "${canonicalUrl}"`],
  ["app/utils/socialSeo.ts", `export const siteUrl = "${canonicalUrl}"`],
];

for (const [file, snippet] of requiredCanonicalSnippets) {
  if (!contents.get(file)?.includes(snippet)) {
    fail(`${file} is missing canonical domain snippet: ${snippet}`);
  }
}

for (const [file, content] of contents) {
  for (const host of staleHosts) {
    if (content.includes(host)) {
      fail(`${file} contains stale host ${host}.`);
    }
  }
}

if (process.exitCode) process.exit();
console.log(`Canonical domain audit passed for ${canonicalUrl}.`);
