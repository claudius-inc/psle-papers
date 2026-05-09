import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = ".output/public";
const sitemapPath = "public/sitemap.xml";
const robotsPath = "public/robots.txt";
const appPath = "app/app.vue";
const analyticsPath = "app/utils/analytics.ts";
const engagementPath = "app/composables/useEngagementTracking.ts";
const keywordMapPath = "SEO_KEYWORD_MAP.md";
const homePagePath = "app/pages/index.vue";
const collectionPagePath = "app/pages/exam-papers/[[slug]].vue";
const viewerPagePath = "app/pages/view/[id].vue";
const socialAssetPath = ".output/public/og-image.png";
const pagesWorkflowPath = ".github/workflows/nuxtjs.yml";

const decodeHtml = (value) =>
  value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

if (!existsSync(root)) {
  fail(`Missing ${root}. Run npm run generate before npm run seo:audit.`);
  process.exit();
}

const htmlFiles = [];
const walkSafe = (dir) => {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walkSafe(full);
    else if (name.name === "index.html") htmlFiles.push(full);
  }
};

walkSafe(root);

const rows = [];
let jsonLdScripts = 0;
const jsonLdFailures = [];
const missingLinks = [];
const checkedLinks = new Set();

const pageExists = (href) => {
  if (href === "/") return existsSync(join(root, "index.html"));
  const clean = href.replace(/\/$/, "");
  const direct = join(root, clean);
  return existsSync(direct) || existsSync(join(direct, "index.html"));
};

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const pagePath = `/${relative(root, file).replace(/\/index\.html$/, "")}`;
  const url = pagePath === "/" ? "/" : pagePath;
  const title = decodeHtml(html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  const description = decodeHtml(
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "",
  );

  rows.push({
    url,
    title,
    description,
    titleLength: title.length,
    descriptionLength: description.length,
  });

  for (const match of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    jsonLdScripts += 1;
    try {
      JSON.parse(decodeHtml(match[1]));
    } catch (error) {
      jsonLdFailures.push(`${file}: ${error.message}`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)=['"]([^'"]+)['"]/g)) {
    let href = match[1];
    if (!href.startsWith("/")) continue;
    href = href.split("#")[0].split("?")[0];
    if (!href) continue;
    if (href.startsWith("/_nuxt/") || href.endsWith("_payload.json")) continue;
    if (["/favicon.ico", "/robots.txt", "/sitemap.xml", "/CNAME"].includes(href)) {
      continue;
    }

    const key = `${file}\t${href}`;
    if (checkedLinks.has(key)) continue;
    checkedLinks.add(key);
    if (!pageExists(href)) missingLinks.push(`${file}: ${href}`);
  }
}

const titles = new Map();
for (const row of rows) {
  if (!row.title) continue;
  titles.set(row.title, [...(titles.get(row.title) || []), row.url]);
}

const duplicateTitleGroups = [...titles.entries()].filter(([, urls]) => urls.length > 1);
const missingTitles = rows.filter((row) => !row.title);
const missingDescriptions = rows.filter((row) => !row.description);
const longTitles = rows.filter((row) => row.titleLength > 70);
const longDescriptions = rows.filter((row) => row.descriptionLength > 170);
const shortDescriptions = rows.filter(
  (row) => row.description && row.descriptionLength < 80,
);

const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "";
const appShell = existsSync(appPath) ? readFileSync(appPath, "utf8") : "";
const analytics = existsSync(analyticsPath) ? readFileSync(analyticsPath, "utf8") : "";
const engagement = existsSync(engagementPath)
  ? readFileSync(engagementPath, "utf8")
  : "";
const keywordMap = existsSync(keywordMapPath)
  ? readFileSync(keywordMapPath, "utf8")
  : "";
const homePage = existsSync(homePagePath) ? readFileSync(homePagePath, "utf8") : "";
const collectionPage = existsSync(collectionPagePath)
  ? readFileSync(collectionPagePath, "utf8")
  : "";
const viewerPage = existsSync(viewerPagePath)
  ? readFileSync(viewerPagePath, "utf8")
  : "";
const pagesWorkflow = existsSync(pagesWorkflowPath)
  ? readFileSync(pagesWorkflowPath, "utf8")
  : "";
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
const sitemapLastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
  (match) => match[1],
);
const uniqueSitemapLastmods = new Set(sitemapLastmods);
const today = new Date().toISOString().slice(0, 10);
const keywordMapPaths = [
  ...new Set(
    [...keywordMap.matchAll(/`(\/[^`\s]+)`/g)]
      .map((match) => match[1])
      .filter((path) => path !== "/" && !path.startsWith("//")),
  ),
];

const requiredSnippets = [
  [".output/public/index.html", "Free Singapore Primary Exam Papers for 2026 Revision"],
  [".output/public/index.html", "SiteNavigationElement"],
  [".output/public/index.html", "Primary 6 Maths Exam Papers"],
  [".output/public/index.html", "isAccessibleForFree"],
  [".output/public/index.html", "DownloadAction"],
  [".output/public/index.html", "SearchAction"],
  [".output/public/index.html", "search_term_string"],
  [".output/public/index.html", "Search papers"],
  [".output/public/index.html", 'property="og:site_name" content="SG Exam Hub"'],
  [".output/public/index.html", 'property="og:image" content="https://sgexamhub.com/og-image.png"'],
  [".output/public/index.html", 'name="twitter:card" content="summary_large_image"'],
  [
    ".output/public/sitemap/index.html",
    "Singapore Primary Exam Paper Sitemap",
  ],
  [
    ".output/public/sitemap/index.html",
    'property="og:image" content="https://sgexamhub.com/og-image.png"',
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "2025 P6 Maths Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    'name="twitter:card" content="summary_large_image"',
  ],
  [
    ".output/public/exam-papers/2025-primary-6-sa2/index.html",
    "2025 P6 SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "2025 P6 Maths SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-sa2/index.html",
    "P6 Maths SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-school-nanyang-primary-school/index.html",
    "P6 Maths Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-school-nanyang-primary-school/index.html",
    "2025 P6 Maths Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/sa2/index.html",
    "SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/sa2/index.html",
    'href="/sitemap"',
  ],
  [
    ".output/public/exam-papers/2025-primary-6-school-raffles-girls-primary-school/index.html",
    "Raffles Girls",
  ],
  [".output/public/view/6_1073_3_4_2025/index.html", "LearningResource"],
  [".output/public/view/6_1073_3_4_2025/index.html", "isAccessibleForFree"],
  [".output/public/view/6_1073_3_4_2025/index.html", "DownloadAction"],
  [".output/public/view/6_1073_3_4_2025/index.html", 'content="index, follow"'],
  [".output/public/view/6_1073_3_4_2025/index.html", "Download PDF"],
  [".output/public/view/6_1073_3_4_2025/index.html", "FAQPage"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Using this paper"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Is the 2025 Raffles Girls"],
  [".output/public/view/6_1073_3_4_2025/index.html", "More from this school"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Same exam type"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Exam paper sitemap"],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    'property="og:type" content="article"',
  ],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    'property="og:image" content="https://sgexamhub.com/og-image.png"',
  ],
];

for (const [file, snippet] of requiredSnippets) {
  if (!existsSync(file)) {
    fail(`Missing required generated page: ${file}`);
    continue;
  }
  if (!readFileSync(file, "utf8").includes(snippet)) {
    fail(`Missing expected snippet in ${file}: ${snippet}`);
  }
}

if (missingTitles.length) fail(`Missing titles: ${missingTitles.length}`);
if (missingDescriptions.length) {
  fail(`Missing descriptions: ${missingDescriptions.length}`);
}
if (duplicateTitleGroups.length) {
  fail(`Duplicate title groups: ${duplicateTitleGroups.length}`);
}
if (longTitles.length) fail(`Titles over 70 decoded chars: ${longTitles.length}`);
if (longDescriptions.length) {
  fail(`Descriptions over 170 decoded chars: ${longDescriptions.length}`);
}
if (shortDescriptions.length) {
  fail(`Descriptions under 80 decoded chars: ${shortDescriptions.length}`);
}
if (jsonLdFailures.length) {
  fail(`Invalid JSON-LD scripts: ${jsonLdFailures.length}`);
  for (const failure of jsonLdFailures.slice(0, 10)) console.error(failure);
}
if (missingLinks.length) {
  fail(`Missing internal links: ${missingLinks.length}`);
  for (const link of missingLinks.slice(0, 20)) console.error(link);
}
if (!existsSync(socialAssetPath)) {
  fail("Generated social preview image is missing.");
}
if (sitemapCount !== htmlFiles.length) {
  fail(`Sitemap URL count ${sitemapCount} does not match generated HTML count ${htmlFiles.length}`);
}
if (sitemapLastmods.length !== sitemapCount) {
  fail(`Sitemap lastmod count ${sitemapLastmods.length} does not match URL count ${sitemapCount}`);
}
if ([...uniqueSitemapLastmods].some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
  fail("Sitemap contains a malformed lastmod date.");
}
if (uniqueSitemapLastmods.size === 1 && uniqueSitemapLastmods.has(today)) {
  fail("Sitemap lastmod dates all use the current build date.");
}
if (!sitemap.includes("https://sgexamhub.com/sitemap")) {
  fail("Sitemap is missing the HTML sitemap page.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2")) {
  fail("Sitemap is missing representative level-subject-type route.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school")) {
  fail("Sitemap is missing representative school level-subject route.");
}
if (!sitemap.includes("https://sgexamhub.com/view/2_7118_3_4_2019")) {
  fail("Sitemap is missing representative older paper viewer URL.");
}
if (!robots.includes("Sitemap: https://sgexamhub.com/sitemap.xml")) {
  fail("robots.txt does not point to the canonical sitemap.");
}
if (!appShell.includes("G-7WKP91PV8C") || !appShell.includes("useEngagementTracking()")) {
  fail("Global app shell is missing GA4 or engagement tracking setup.");
}
if (
  !pagesWorkflow.includes("FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true") ||
  !pagesWorkflow.includes('node-version: "24"')
) {
  fail("Pages workflow is not pinned to the Node 24 actions/build runtime.");
}
for (const eventName of ["paper_view_click", "paper_open", "paper_download"]) {
  if (!analytics.includes(eventName)) {
    fail(`Analytics helper is missing ${eventName}.`);
  }
}
for (const snippet of [
  "paperSearchQuery",
  "trackPaperSearch",
  "paper_search",
  "Search papers",
  "homeAnalyticsContext",
  "trackHomePaperView",
  "trackHomePaperDownload",
  "search_query",
  "buildSocialMeta",
  "SearchAction",
  "search_term_string",
]) {
  if (!homePage.includes(snippet)) {
    fail(`Homepage is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "collectionAnalyticsContext",
  "page_slug",
  "page_path",
  "trackCollectionPaperView",
  "trackCollectionPaperDownload",
  "paperSearchQuery",
  "trackCollectionPaperSearch",
  "index_search",
  "Search papers",
  "search_query",
  "buildSocialMeta",
]) {
  if (!collectionPage.includes(snippet)) {
    fail(`Collection page is missing analytics attribution snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "viewerAnalyticsContext",
  "relatedPaperAnalyticsContext",
  "trackViewerPaperDownload",
  "trackViewerPaperOpen",
  "trackViewerRelatedPaperView",
  "target_paper_id",
  "related_section",
  "buildSocialMeta",
  "viewerFaqItems",
  "Using this paper",
  "FAQPage",
]) {
  if (!viewerPage.includes(snippet)) {
    fail(`Viewer page is missing analytics attribution snippet: ${snippet}.`);
  }
}
for (const eventName of ["page_engaged_time", "page_scroll_depth"]) {
  if (!engagement.includes(eventName)) {
    fail(`Engagement tracker is missing ${eventName}.`);
  }
}
if (!keywordMapPaths.length) {
  fail("Keyword map is missing preferred landing page paths.");
}
for (const path of keywordMapPaths) {
  if (!pageExists(path)) {
    fail(`Keyword map preferred landing page is not generated: ${path}`);
  }
}

console.log(`SEO audit checked ${htmlFiles.length} HTML pages.`);
console.log(`Checked ${checkedLinks.size} internal links.`);
console.log(`Parsed ${jsonLdScripts} JSON-LD scripts.`);
console.log(`Sitemap URLs: ${sitemapCount}.`);

if (process.exitCode) process.exit();
console.log("SEO audit passed.");
