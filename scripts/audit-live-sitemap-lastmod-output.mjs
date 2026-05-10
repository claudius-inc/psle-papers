import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const siteUrl = "https://sgexamhub.com";
const today = new Date().toISOString().slice(0, 10);

const staticFreshnessInputs = [
  "app/app.vue",
  "app/pages/index.vue",
  "app/pages/free-exam-papers.vue",
  "app/pages/past-year-exam-papers.vue",
  "app/pages/test-papers.vue",
  "app/pages/top-school-exam-papers.vue",
  "app/pages/exam-papers/[[slug]].vue",
  "app/pages/sitemap.vue",
  "app/pages/view/[id].vue",
  "app/utils/paperSeo.ts",
  "public/json/files.json",
  "public/json/dropdownOptions.json",
  "scripts/ensure-snippet-focused-ui.mjs",
  "scripts/ensure-viewer-school-seo.mjs",
  "scripts/generate-sitemap.mjs",
];

const priorityCollectionUrls = [
  `${siteUrl}/`,
  `${siteUrl}/exam-papers`,
  `${siteUrl}/free-exam-papers`,
  `${siteUrl}/past-year-exam-papers`,
  `${siteUrl}/test-papers`,
  `${siteUrl}/top-school-exam-papers`,
  `${siteUrl}/exam-papers/2026-revision`,
  `${siteUrl}/exam-papers/psle-revision`,
  `${siteUrl}/exam-papers/2025`,
  `${siteUrl}/exam-papers/2024`,
  `${siteUrl}/exam-papers/sa2`,
  `${siteUrl}/exam-papers/2025-primary-6-mathematics-sa2`,
  `${siteUrl}/exam-papers/2025-primary-6-science-sa2`,
  `${siteUrl}/exam-papers/primary-6`,
  `${siteUrl}/exam-papers/primary-6-sa2`,
  `${siteUrl}/exam-papers/school-raffles-girls-primary-school`,
  `${siteUrl}/exam-papers/school-nanyang-primary-school`,
  `${siteUrl}/exam-papers/school-henry-park-primary-school`,
  `${siteUrl}/exam-papers/school-methodist-girls-school-primary`,
  `${siteUrl}/exam-papers/school-anglo-chinese-school-primary`,
  `${siteUrl}/exam-papers/school-anglo-chinese-school-junior`,
];

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const getGitLastModifiedDates = () => {
  const dates = new Map();

  try {
    const output = execFileSync(
      "git",
      ["log", "--format=@@date:%cs", "--name-only", "--", ...staticFreshnessInputs],
      { encoding: "utf8" },
    );

    let currentDate = "";
    for (const line of output.split("\n")) {
      if (line.startsWith("@@date:")) {
        currentDate = line.replace("@@date:", "").trim();
        continue;
      }
      const path = line.trim();
      if (!path || dates.has(path)) continue;
      dates.set(path, currentDate);
    }
  } catch {
    // Fall back to filesystem mtimes when git history is unavailable.
  }

  return dates;
};

const gitLastModifiedDates = getGitLastModifiedDates();

const getPathLastModified = (path, fallbackDate = today) => {
  const gitDate = gitLastModifiedDates.get(path);
  if (gitDate) return gitDate;
  if (existsSync(path)) return toIsoDate(statSync(path).mtime);
  return fallbackDate;
};

const expectedStaticLastmod =
  staticFreshnessInputs
    .map((path) => getPathLastModified(path))
    .sort()
    .at(-1) || today;

const response = await fetch(`${siteUrl}/sitemap.xml`, {
  headers: {
    "user-agent": "SGExamHubLiveSitemapLastmodAudit/1.0",
  },
});

if (!response.ok) {
  throw new Error(`${siteUrl}/sitemap.xml returned ${response.status}`);
}

const sitemap = await response.text();
const sitemapEntries = new Map(
  [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(
    ([, loc, lastmod]) => [loc, lastmod],
  ),
);

const failures = [];
for (const url of priorityCollectionUrls) {
  const lastmod = sitemapEntries.get(url);
  if (!lastmod) {
    failures.push(`Live sitemap is missing priority collection URL: ${url}`);
    continue;
  }
  if (lastmod < expectedStaticLastmod) {
    failures.push(
      `Live priority collection sitemap lastmod is stale for ${url}: expected at least ${expectedStaticLastmod}, got ${lastmod}`,
    );
  }
}

if (failures.length) {
  throw new Error(failures.join("\n"));
}

console.log(`Live sitemap priority collection lastmod audit passed (${expectedStaticLastmod}).`);
