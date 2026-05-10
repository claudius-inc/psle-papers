import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = ".output/public";
const siteUrl = "https://sgexamhub.com";
const today = new Date().toISOString().slice(0, 10);

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const readText = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");

const decodeHtml = (value) =>
  value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

if (!existsSync(root)) {
  fail(`Missing ${root}. Run npm run generate before npm run seo:audit.`);
  process.exit();
}

const htmlFiles = [];
const walkSafe = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) walkSafe(fullPath);
    else if (entry.name === "index.html") htmlFiles.push(fullPath);
  }
};
walkSafe(root);

const pageExists = (href) => {
  if (href === "/") return existsSync(join(root, "index.html"));
  const clean = href.replace(/\/$/, "");
  const direct = join(root, clean);
  return existsSync(direct) || existsSync(join(direct, "index.html"));
};

const shouldSkipLocalAsset = (href) => {
  if (href.startsWith("/_nuxt/") || href.endsWith("_payload.json")) return true;
  if (["/favicon.ico", "/robots.txt", "/sitemap.xml", "/CNAME"].includes(href)) {
    return true;
  }
  return [".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".json", ".txt"].includes(
    extname(href),
  );
};

const rows = [];
const checkedLinks = new Set();
const duplicateTitles = new Map();
const missingLinks = [];
const selfHostedPdfLinks = [];
const jsonLdFailures = [];
const missingCanonicalRows = [];
const mismatchedCanonicalRows = [];
const mismatchedOgUrlRows = [];
const missingTwitterCardRows = [];
const weakSchoolNameHtmlRows = [];
let jsonLdScripts = 0;

for (const file of htmlFiles) {
  const html = readText(file);
  const relativePath = relative(root, file);
  const routePath =
    relativePath === "index.html"
      ? "/"
      : `/${relativePath.replace(/\/index\.html$/, "")}`;
  const expectedCanonical = `${siteUrl}${routePath === "/" ? "/" : routePath}`;
  const title = decodeHtml(html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  const description = decodeHtml(
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "",
  );
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "";
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] || "";
  const robotsMeta = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || "";

  if (!title) fail(`Missing title: ${routePath}`);
  if (!description) fail(`Missing description: ${routePath}`);
  if (!robotsMeta) {
    fail(`Missing robots meta: ${routePath}`);
  } else if (
    !robotsMeta.includes("noindex") &&
    (!robotsMeta.includes("index, follow") ||
      !robotsMeta.includes("max-snippet:160") ||
      !robotsMeta.includes("max-image-preview:large"))
  ) {
    fail(`Indexable page is missing snippet-focused robots directives: ${routePath}`);
  }
  if (title.length > 70) fail(`Title over 70 decoded chars: ${routePath}`);
  if (description.length > 170) fail(`Description over 170 decoded chars: ${routePath}`);
  if (description && description.length < 80) fail(`Description under 80 decoded chars: ${routePath}`);
  if (!html.includes('name="twitter:card" content="summary_large_image"')) {
    missingTwitterCardRows.push(routePath);
  }
  if (!canonical) missingCanonicalRows.push(routePath);
  else if (canonical !== expectedCanonical) {
    mismatchedCanonicalRows.push(`${routePath}: expected ${expectedCanonical}, got ${canonical}`);
  }
  if (ogUrl && ogUrl !== expectedCanonical) {
    mismatchedOgUrlRows.push(`${routePath}: expected ${expectedCanonical}, got ${ogUrl}`);
  }
  if (html.includes('href="/files/') || html.includes("https://sgexamhub.com/files/")) {
    selfHostedPdfLinks.push(file);
  }
  if (/\b(?:Anglo chinese|Chij)\b|\((?:primary|junior)\)/.test(html)) {
    weakSchoolNameHtmlRows.push(routePath);
  }
  if (/\b(?:Anglo chinese|Chij)\b/.test(`${title} ${description}`)) {
    fail(`Weak school-name casing in snippet: ${routePath}`);
  }
  if (/^1 free [^.]*\b(?:exam papers|papers|PDFs)\./i.test(description)) {
    fail(`One-paper description uses plural wording: ${routePath}`);
  }

  duplicateTitles.set(title, [...(duplicateTitles.get(title) || []), routePath]);
  rows.push({ routePath, title, description });

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
    if (!href || shouldSkipLocalAsset(href)) continue;
    const key = `${file}\t${href}`;
    if (checkedLinks.has(key)) continue;
    checkedLinks.add(key);
    if (!pageExists(href)) missingLinks.push(`${file}: ${href}`);
  }
}

for (const [title, urls] of duplicateTitles.entries()) {
  if (title && urls.length > 1) fail(`Duplicate title: ${title} (${urls.length} pages)`);
}

const reportList = (label, rowsToReport) => {
  if (!rowsToReport.length) return;
  fail(`${label}: ${rowsToReport.length}`);
  for (const row of rowsToReport.slice(0, 20)) console.error(row);
};

reportList("Missing canonical links", missingCanonicalRows);
reportList("Canonical URLs do not match generated routes", mismatchedCanonicalRows);
reportList("Open Graph URLs do not match generated routes", mismatchedOgUrlRows);
reportList("Missing large Twitter card metadata", missingTwitterCardRows);
reportList("Weak school-name casing in generated HTML", weakSchoolNameHtmlRows);
reportList("Invalid JSON-LD scripts", jsonLdFailures);
reportList("Missing internal links", missingLinks);
reportList("Generated pages still link to self-hosted PDF files", selfHostedPdfLinks);

const sitemap = readText("public/sitemap.xml");
const robots = readText("public/robots.txt");
const appShell = readText("app/app.vue");
const analytics = readText("app/utils/analytics.ts");
const engagement = readText("app/composables/useEngagementTracking.ts");
const keywordMap = readText("SEO_KEYWORD_MAP.md");
const seoRunbook = readText("SEO_RUNBOOK.md");
const packageJson = readText("package.json");
const seoExportTemplateScript = readText("scripts/generate-seo-export-templates.mjs");
const seoActionPackScript = readText("scripts/generate-seo-action-pack.mjs");
const reindexStatusScript = readText("scripts/analyze-gsc-reindex-tracker.mjs");
const snippetStatusScript = readText("scripts/analyze-google-snippet-tracker.mjs");
const completionCheckScript = readText("scripts/check-seo-completion.mjs");
const seoActionPack = readText("reports/seo/reindex-action-pack.md");
const urlInspectionTracker = readText("reports/seo/gsc-url-inspection-tracker.csv");
const googleSnippetTracker = readText("reports/seo/google-snippet-recheck-tracker.csv");
const outcomeExportChecklist = readText("reports/seo/outcome-export-checklist.md");
const homePage = readText("app/pages/index.vue");
const freeExamPapersPage = readText("app/pages/free-exam-papers.vue");
const pastYearPage = readText("app/pages/past-year-exam-papers.vue");
const testPaperPage = readText("app/pages/test-papers.vue");
const topSchoolPage = readText("app/pages/top-school-exam-papers.vue");
const collectionPage = readText("app/pages/exam-papers/[[slug]].vue");
const viewerPage = readText("app/pages/view/[id].vue");
const revisionPage = readText("app/pages/exam-papers/2026-revision.vue");
const pslePage = readText("app/pages/exam-papers/psle-revision.vue");
const pagesWorkflow = readText(".github/workflows/nuxtjs.yml");

const requireGeneratedSnippet = (file, snippet) => {
  if (!existsSync(file)) {
    fail(`Missing required generated page: ${file}`);
    return;
  }
  if (!readText(file).includes(snippet)) fail(`Missing expected snippet in ${file}: ${snippet}`);
};

for (const [file, snippet] of [
  [".output/public/index.html", "SG Exam Hub: Free Singapore Primary Exam Papers"],
  [".output/public/index.html", "No sign-up needed"],
  [".output/public/index.html", "2,299 PDF exam papers indexed"],
  [".output/public/index.html", "SearchAction"],
  [".output/public/index.html", "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers"],
  [".output/public/exam-papers/index.html", "Singapore Primary Exam Papers PDF | Free Download"],
  [".output/public/exam-papers/2026-revision/index.html", "2026 Primary Exam Papers Revision"],
  [".output/public/exam-papers/psle-revision/index.html", "PSLE Revision Papers"],
  [".output/public/free-exam-papers/index.html", "Free Exam Papers Singapore"],
  [".output/public/past-year-exam-papers/index.html", "Past Year Exam Papers Singapore"],
  [".output/public/test-papers/index.html", "Singapore Primary Test Papers"],
  [".output/public/top-school-exam-papers/index.html", "Top School Exam Papers Singapore"],
  [".output/public/sitemap/index.html", "Singapore Primary Exam Paper Sitemap"],
  [".output/public/view/6_1073_3_4_2025/index.html", "LearningResource"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Free PDF Download"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Download PDF"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Practice sequence"],
]) {
  requireGeneratedSnippet(file, snippet);
}

if (!existsSync(".output/public/og-image.png")) fail("Generated social preview image is missing.");

const sitemapCount = (sitemap.match(/<url>/g) || []).length;
const sitemapLastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
  (match) => match[1],
);
const uniqueSitemapLastmods = new Set(sitemapLastmods);
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
for (const url of [
  "https://sgexamhub.com/sitemap",
  "https://sgexamhub.com/free-exam-papers",
  "https://sgexamhub.com/past-year-exam-papers",
  "https://sgexamhub.com/test-papers",
  "https://sgexamhub.com/top-school-exam-papers",
  "https://sgexamhub.com/exam-papers/2026-revision",
  "https://sgexamhub.com/exam-papers/psle-revision",
  "https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2",
  "https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school",
  "https://sgexamhub.com/view/2_7118_3_4_2019",
]) {
  if (!sitemap.includes(url)) fail(`Sitemap is missing expected URL: ${url}`);
}
if (!robots.includes("Sitemap: https://sgexamhub.com/sitemap.xml")) {
  fail("robots.txt does not point to the canonical sitemap.");
}

for (const snippet of [
  "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true",
  'node-version: "24"',
  "actions/checkout@v6",
  "actions/setup-node@v6",
  "actions/configure-pages@v6",
  "actions/upload-pages-artifact@v5",
  "actions/deploy-pages@v5",
  "Remove PDFs from Pages artifact",
  "rm -rf ./.output/public/files",
]) {
  if (!pagesWorkflow.includes(snippet)) {
    fail(`Pages workflow is missing Node 24 deployment snippet: ${snippet}`);
  }
}
if (pagesWorkflow.includes("actions/checkout@v5")) {
  fail("Pages workflow still references actions/checkout@v5.");
}

for (const snippet of [
  '"seo:audit": "node scripts/generate-seo-export-templates.mjs && node scripts/generate-seo-action-pack.mjs &&',
  '"seo:action-pack": "node scripts/generate-seo-action-pack.mjs"',
  '"seo:reindex-status": "node scripts/analyze-gsc-reindex-tracker.mjs"',
  '"seo:snippet-status": "node scripts/analyze-google-snippet-tracker.mjs"',
  '"seo:completion-check": "node scripts/check-seo-completion.mjs"',
  '"seo:export-templates": "node scripts/generate-seo-export-templates.mjs"',
  '"seo:outcomes": "node scripts/analyze-seo-outcomes.mjs"',
]) {
  if (!packageJson.includes(snippet)) {
    fail(`package.json is missing SEO workflow script: ${snippet}`);
  }
}
for (const snippet of [
  "reports/seo/gsc-before-template.csv",
  "reports/seo/gsc-after-template.csv",
  "reports/seo/ga4-organic-events-template.csv",
  "outcome-export-checklist.md",
]) {
  if (!seoExportTemplateScript.includes(snippet)) {
    fail(`SEO export-template generator is missing expected snippet: ${snippet}`);
  }
}
for (const [path, expected] of [
  ["reports/seo/gsc-before-template.csv", "Query,Page,Clicks,Impressions,CTR,Position"],
  ["reports/seo/gsc-after-template.csv", "Query,Page,Clicks,Impressions,CTR,Position"],
  ["reports/seo/ga4-organic-events-template.csv", "Event name,Landing page,Session source / medium,Event count"],
]) {
  if (!readText(path).includes(expected)) {
    fail(`${path} is missing expected export-template header: ${expected}`);
  }
}
for (const snippet of [
  "SEO Outcome Export Templates",
  "Required GSC Export Shape",
  "Required GA4 Export Shape",
  "npm run seo:outcomes",
]) {
  if (!outcomeExportChecklist.includes(snippet)) {
    fail(`SEO outcome export checklist is missing expected snippet: ${snippet}`);
  }
}
if (!seoRunbook.includes("npm run seo:export-templates")) {
  fail("SEO runbook is missing the export-template generation command.");
}
for (const snippet of [
  "reports/seo/reindex-action-pack.md",
  "reports/seo/gsc-url-inspection-tracker.csv",
  "reports/seo/google-snippet-recheck-tracker.csv",
  "urlInspectionPriority",
  "searchRecheckQueries",
  "gscQueryClusters",
  "ga4Events",
]) {
  if (!seoActionPackScript.includes(snippet)) {
    fail(`SEO action-pack generator is missing expected snippet: ${snippet}`);
  }
}
for (const snippet of [
  "SEO Reindex And Outcome Action Pack",
  "Google Search Console URL Inspection",
  "reports/seo/gsc-url-inspection-tracker.csv",
  "reports/seo/google-snippet-recheck-tracker.csv",
  "Public Google Recheck Queries",
  "GSC Outcome Export",
  "GA4 Organic Outcome Export",
  "npm run seo:export-templates",
  "npm run seo:outcomes",
]) {
  if (!seoActionPack.includes(snippet) || !seoRunbook.includes("seo:action-pack")) {
    fail(`SEO action-pack handoff is missing expected snippet: ${snippet}`);
  }
}
for (const snippet of [
  "Priority,URL,GSC live test result,Indexing requested at,Google result rechecked at,Status,Notes",
  "https://sgexamhub.com/",
  "https://sgexamhub.com/exam-papers/2026-revision/",
  "https://sgexamhub.com/exam-papers/psle-revision/",
  "https://sgexamhub.com/view/6_1073_3_4_2025/",
]) {
  if (!urlInspectionTracker.includes(snippet)) {
    fail(`GSC URL Inspection tracker is missing expected snippet: ${snippet}`);
  }
}
for (const snippet of [
  "GSC URL Inspection Status",
  "reports/seo/gsc-url-inspection-tracker.csv",
  "reports/seo/gsc-url-inspection-status.md",
  "--fail-on-pending",
  "The SEO objective remains incomplete",
]) {
  if (!reindexStatusScript.includes(snippet)) {
    fail(`GSC URL Inspection status script is missing expected snippet: ${snippet}`);
  }
}
for (const snippet of [
  "Query,Google search URL,Checked at,Stale snippet found,Status,Notes",
  "site:sgexamhub.com sg exam papers",
  "2,200+Papers",
  "Anglo chinese",
  "https://www.google.com/search?q=",
]) {
  if (!googleSnippetTracker.includes(snippet)) {
    fail(`Google snippet recheck tracker is missing expected snippet: ${snippet}`);
  }
}
for (const snippet of [
  "Google Snippet Recheck Status",
  "reports/seo/google-snippet-recheck-tracker.csv",
  "reports/seo/google-snippet-recheck-status.md",
  "--fail-on-stale",
  "The SEO objective remains incomplete",
]) {
  if (!snippetStatusScript.includes(snippet)) {
    fail(`Google snippet status script is missing expected snippet: ${snippet}`);
  }
}
for (const snippet of [
  "SEO Completion Check",
  "seo:reindex-status",
  "seo:snippet-status",
  "seo:outcomes",
  "reports/seo/seo-completion-check.md",
  "reports/seo/outcome-report.md",
  "Do not mark the SEO objective complete",
]) {
  if (!completionCheckScript.includes(snippet)) {
    fail(`SEO completion check script is missing expected snippet: ${snippet}`);
  }
}

if (!appShell.includes("G-7WKP91PV8C") || !appShell.includes("useEngagementTracking()")) {
  fail("Global app shell is missing GA4 or engagement tracking setup.");
}
if (!appShell.includes("max-snippet:160") || !appShell.includes("max-image-preview:large")) {
  fail("Global app shell is missing snippet-focused robots directives.");
}
if (!appShell.includes("send_page_view: false")) {
  fail("Global app shell must disable automatic GA4 page_view duplication.");
}
for (const snippet of [
  "page_view",
  "paper_view_click",
  "paper_open",
  "paper_download",
  "sg_exam_hub_attribution",
  "landing_path",
  "referrer_host",
  "is_google_referrer",
  "trackPageView",
  "page_location",
  "page_path",
  "page_title",
  "window.sessionStorage",
]) {
  if (!analytics.includes(snippet)) fail(`Analytics helper is missing expected snippet: ${snippet}.`);
}
for (const snippet of [
  "page_engaged_time",
  "page_scroll_depth",
  "page_session_summary",
  'trackPageView("initial_load")',
  'trackPageView("route_change")',
  "max_scroll_percent",
  "for (const threshold of [25, 50, 75, 90])",
]) {
  if (!engagement.includes(snippet)) fail(`Engagement tracking is missing expected snippet: ${snippet}.`);
}

const requireSourceSnippets = (label, source, snippets) => {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) fail(`${label} is missing expected source snippet: ${snippet}.`);
  }
};

requireSourceSnippets("Homepage", homePage, [
  "2026 Primary Exam Papers Revision",
  "Free Exam Papers Singapore",
  "Past Year Exam Papers Singapore",
  "Singapore Primary Test Papers",
  "Top School Exam Papers Singapore",
  "paperSearchQuery",
  "trackPaperSearch",
  "No sign-up needed",
  "SearchAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("Free exam papers page", freeExamPapersPage, [
  "Free Exam Papers Singapore",
  "freePaperCollections",
  "trackFreePaperView",
  "trackFreePaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("Past year exam papers page", pastYearPage, [
  "Past Year Exam Papers Singapore",
  "pastYearCollections",
  "trackPastYearPaperView",
  "trackPastYearPaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("Test papers page", testPaperPage, [
  "Free Test Papers Singapore",
  "Singapore Primary Test Papers",
  "testPaperCollections",
  "trackTestPaperView",
  "trackTestPaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("Top school page", topSchoolPage, [
  "Top School Exam Papers Singapore",
  "topSchoolCollections",
  "trackTopSchoolPaperView",
  "trackTopSchoolPaperDownload",
  "Raffles Girls' Primary School",
  "Nanyang Primary School",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("2026 revision page", revisionPage, [
  "2026 Primary Exam Papers Revision",
  "revisionCollections",
  "trackRevisionPaperView",
  "trackRevisionPaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("PSLE revision page", pslePage, [
  "PSLE Practice Papers | Primary 6 Revision PDFs",
  "PSLE Revision Papers",
  "psleCollections",
  "trackPslePaperView",
  "trackPslePaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]);
requireSourceSnippets("Collection page", collectionPage, [
  "collectionAnalyticsContext",
  "trackCollectionPaperView",
  "trackCollectionPaperDownload",
  "trackCollectionHeroPaperView",
  "trackCollectionHeroPaperDownload",
  "trackCollectionMobilePaperView",
  "trackCollectionMobilePaperDownload",
  "collection_hero_cta",
  "collection_mobile_sticky",
  "mobile-collection-action-bar",
  "Open Newest",
  "visiblePapers",
  "canShowMore",
  "showMorePapers",
  "paper_show_more",
  "Show more papers",
  "HowTo",
  "paperSearchQuery",
  "trackCollectionPaperSearch",
  "buildSocialMeta",
  "buildPdfFileUrl",
]);
requireSourceSnippets("Viewer page", viewerPage, [
  "viewerAnalyticsContext",
  "trackViewerPaperDownload",
  "trackViewerPaperOpen",
  "trackViewerRelatedPaperView",
  "buildSocialMeta",
  "buildPdfFileUrl",
  "FAQPage",
  "HowTo",
  "Revision checklist",
  "Free PDF Download",
  "Practice sequence",
  "mobile-action-bar",
]);
requireSourceSnippets("SEO runbook", seoRunbook, [
  "https://sgexamhub.com/free-exam-papers",
  "https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2",
  "past year exam papers singapore",
  "free test papers singapore",
  "top school exam papers singapore",
  "page_view",
  "paper_download",
  "page_engaged_time",
]);

const keywordMapPaths = [
  ...new Set(
    [...keywordMap.matchAll(/`(\/[^`\s]+)`/g)]
      .map((match) => match[1])
      .filter((path) => path !== "/" && !path.startsWith("//")),
  ),
];
if (!keywordMapPaths.length) fail("Keyword map is missing preferred landing page paths.");
for (const path of keywordMapPaths) {
  if (!pageExists(path)) fail(`Keyword map preferred landing page is not generated: ${path}`);
}

console.log(`SEO audit checked ${htmlFiles.length} HTML pages.`);
console.log(`Checked ${checkedLinks.size} internal links.`);
console.log(`Parsed ${jsonLdScripts} JSON-LD scripts.`);
console.log(`Sitemap URLs: ${sitemapCount}.`);

if (process.exitCode) process.exit();
console.log("SEO audit passed.");
