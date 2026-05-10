import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = ".output/public";
const siteUrl = "https://sgexamhub.com";
const sitemapPath = "public/sitemap.xml";
const robotsPath = "public/robots.txt";
const appPath = "app/app.vue";
const analyticsPath = "app/utils/analytics.ts";
const engagementPath = "app/composables/useEngagementTracking.ts";
const keywordMapPath = "SEO_KEYWORD_MAP.md";
const seoRunbookPath = "SEO_RUNBOOK.md";
const homePagePath = "app/pages/index.vue";
const freeExamPapersPagePath = "app/pages/free-exam-papers.vue";
const pastYearPagePath = "app/pages/past-year-exam-papers.vue";
const testPaperPagePath = "app/pages/test-papers.vue";
const topSchoolPagePath = "app/pages/top-school-exam-papers.vue";
const collectionPagePath = "app/pages/exam-papers/[[slug]].vue";
const viewerPagePath = "app/pages/view/[id].vue";
const revisionPagePath = "app/pages/exam-papers/2026-revision.vue";
const pslePagePath = "app/pages/exam-papers/psle-revision.vue";
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
const selfHostedPdfLinks = [];
const missingCanonicalRows = [];
const mismatchedCanonicalRows = [];
const mismatchedOgUrlRows = [];
const missingTwitterCardRows = [];
const checkedLinks = new Set();

const pageExists = (href) => {
  if (href === "/") return existsSync(join(root, "index.html"));
  const clean = href.replace(/\/$/, "");
  const direct = join(root, clean);
  return existsSync(direct) || existsSync(join(direct, "index.html"));
};

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const relativePath = relative(root, file);
  const routePath =
    relativePath === "index.html"
      ? "/"
      : `/${relativePath.replace(/\/index\.html$/, "")}`;
  const url = routePath;
  const expectedCanonical = `${siteUrl}${url === "/" ? "/" : url}`;
  const title = decodeHtml(html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  const description = decodeHtml(
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "",
  );
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "";
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] || "";
  const hasTwitterCard = html.includes('name="twitter:card" content="summary_large_image"');

  if (!canonical) {
    missingCanonicalRows.push(url);
  } else if (canonical !== expectedCanonical) {
    mismatchedCanonicalRows.push(`${url}: expected ${expectedCanonical}, got ${canonical}`);
  }
  if (ogUrl && ogUrl !== expectedCanonical) {
    mismatchedOgUrlRows.push(`${url}: expected ${expectedCanonical}, got ${ogUrl}`);
  }
  if (!hasTwitterCard) {
    missingTwitterCardRows.push(url);
  }

  if (html.includes('href="/files/') || html.includes("https://sgexamhub.com/files/")) {
    selfHostedPdfLinks.push(file);
  }

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
const weakSchoolNameRows = rows.filter((row) =>
  /\b(?:Anglo chinese|Chij)\b/.test(`${row.title} ${row.description}`),
);
const onePaperPluralDescriptionRows = rows.filter((row) =>
  /^1 free [^.]*\b(?:exam papers|papers|PDFs)\./i.test(row.description),
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
const seoRunbook = existsSync(seoRunbookPath) ? readFileSync(seoRunbookPath, "utf8") : "";
const homePage = existsSync(homePagePath) ? readFileSync(homePagePath, "utf8") : "";
const freeExamPapersPage = existsSync(freeExamPapersPagePath)
  ? readFileSync(freeExamPapersPagePath, "utf8")
  : "";
const pastYearPage = existsSync(pastYearPagePath)
  ? readFileSync(pastYearPagePath, "utf8")
  : "";
const testPaperPage = existsSync(testPaperPagePath)
  ? readFileSync(testPaperPagePath, "utf8")
  : "";
const topSchoolPage = existsSync(topSchoolPagePath)
  ? readFileSync(topSchoolPagePath, "utf8")
  : "";
const collectionPage = existsSync(collectionPagePath)
  ? readFileSync(collectionPagePath, "utf8")
  : "";
const viewerPage = existsSync(viewerPagePath)
  ? readFileSync(viewerPagePath, "utf8")
  : "";
const revisionPage = existsSync(revisionPagePath)
  ? readFileSync(revisionPagePath, "utf8")
  : "";
const pslePage = existsSync(pslePagePath) ? readFileSync(pslePagePath, "utf8") : "";
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
  [".output/public/index.html", "SG Exam Hub: Free Singapore Primary Exam Papers | 2026"],
  [".output/public/index.html", "SG exam papers"],
  [".output/public/index.html", "SG Exam Papers"],
  [".output/public/index.html", "Latest available papers: 2025"],
  [".output/public/index.html", "2,299 PDF exam papers indexed"],
  [".output/public/index.html", "Start with a latest paper"],
  [".output/public/index.html", "2025 P6 English SA2"],
  [".output/public/index.html", "2026 Primary Exam Papers Revision"],
  [".output/public/index.html", 'href="/exam-papers/2026-revision"'],
  [".output/public/index.html", "Free Exam Papers Singapore"],
  [".output/public/index.html", 'href="/free-exam-papers"'],
  [".output/public/index.html", "Past Year Exam Papers Singapore"],
  [".output/public/index.html", 'href="/past-year-exam-papers"'],
  [".output/public/index.html", "Singapore Primary Test Papers"],
  [".output/public/index.html", 'href="/test-papers"'],
  [".output/public/index.html", "Top School Exam Papers Singapore"],
  [".output/public/index.html", 'href="/top-school-exam-papers"'],
  [".output/public/index.html", "PSLE Revision Papers"],
  [".output/public/index.html", 'href="/exam-papers/psle-revision"'],
  [".output/public/index.html", "PSLE revision paths"],
  [".output/public/index.html", "Start with Primary 6 SA2 exam papers"],
  [".output/public/index.html", "2025 Primary 6 SA2 Exam Papers"],
  [
    ".output/public/index.html",
    "2025 Nanyang Primary School SA2 Exam Papers",
  ],
  [
    ".output/public/index.html",
    'href="/exam-papers/2025-sa2-school-nanyang-primary-school"',
  ],
  [
    ".output/public/index.html",
    "2025 Raffles Girls&#39; Primary School SA2 Exam Papers",
  ],
  [
    ".output/public/index.html",
    'href="/exam-papers/2025-sa2-school-raffles-girls-primary-school"',
  ],
  [".output/public/index.html", 'href="/exam-papers/primary-6-science-sa2"'],
  [".output/public/index.html", "SiteNavigationElement"],
  [".output/public/index.html", "Primary 6 Maths Exam Papers"],
  [".output/public/index.html", "isAccessibleForFree"],
  [".output/public/index.html", "DownloadAction"],
  [".output/public/index.html", "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers"],
  [".output/public/index.html", "SearchAction"],
  [".output/public/index.html", "search_term_string"],
  [".output/public/index.html", "Search papers"],
  [".output/public/index.html", 'property="og:site_name" content="SG Exam Hub"'],
  [".output/public/index.html", 'property="og:image" content="https://sgexamhub.com/og-image.png"'],
  [".output/public/index.html", 'name="twitter:card" content="summary_large_image"'],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "2026 Primary Exam Papers Revision",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "Use the latest available 2025 and 2024 Singapore primary school exam",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "Choose a 2026 revision collection",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    'href="/exam-papers/2025-primary-6-sa2"',
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "Latest papers for 2026 revision",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "Primary 6 SA2 papers for 2026 preparation",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "Are there 2026 Singapore primary exam papers here?",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "FAQPage",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "DownloadAction",
  ],
  [
    ".output/public/exam-papers/2026-revision/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "PSLE Practice Papers | Primary 6 Revision PDFs",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "PSLE Revision Papers",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "Use free PSLE revision papers and PSLE practice papers from Primary 6",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "Choose a Primary 6 practice set",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    'href="/exam-papers/2025-primary-6-sa2"',
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "Recent Primary 6 papers for PSLE revision",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "Primary 6 SA2 papers for PSLE timing",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "Are these papers useful for PSLE revision?",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "FAQPage",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "DownloadAction",
  ],
  [
    ".output/public/exam-papers/psle-revision/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [
    ".output/public/sitemap/index.html",
    "Singapore Primary Exam Paper Sitemap",
  ],
  [
    ".output/public/sitemap/index.html",
    'property="og:image" content="https://sgexamhub.com/og-image.png"',
  ],
  [
    ".output/public/sitemap/index.html",
    "Quick Revision Paths",
  ],
  [
    ".output/public/sitemap/index.html",
    "Current Revision Hubs",
  ],
  [
    ".output/public/sitemap/index.html",
    "Free Exam Papers Singapore",
  ],
  [
    ".output/public/sitemap/index.html",
    'href="/free-exam-papers"',
  ],
  [
    ".output/public/sitemap/index.html",
    "Past Year Exam Papers Singapore",
  ],
  [
    ".output/public/sitemap/index.html",
    'href="/past-year-exam-papers"',
  ],
  [
    ".output/public/sitemap/index.html",
    "Singapore Primary Test Papers",
  ],
  [
    ".output/public/sitemap/index.html",
    'href="/test-papers"',
  ],
  [
    ".output/public/sitemap/index.html",
    "Top School Exam Papers Singapore",
  ],
  [
    ".output/public/sitemap/index.html",
    'href="/top-school-exam-papers"',
  ],
  [
    ".output/public/sitemap/index.html",
    "2026 Primary Exam Papers Revision",
  ],
  [
    ".output/public/sitemap/index.html",
    'href="/exam-papers/2026-revision"',
  ],
  [
    ".output/public/sitemap/index.html",
    "PSLE Revision Papers",
  ],
  [
    ".output/public/sitemap/index.html",
    'href="/exam-papers/psle-revision"',
  ],
  [
    ".output/public/sitemap/index.html",
    "2025 Primary 6 Maths SA2 Exam Papers",
  ],
  [
    ".output/public/sitemap/index.html",
    "P6 Maths Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "Free Exam Papers Singapore",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "Download free Singapore primary exam papers",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "Start with a free paper",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "Free exam paper collections",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "Latest free exam papers",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "Are these Singapore exam papers free to download?",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "FAQPage",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "DownloadAction",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [
    ".output/public/free-exam-papers/index.html",
    'property="og:image" content="https://sgexamhub.com/og-image.png"',
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "Past Year Exam Papers Singapore",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "Download Singapore primary past year exam papers",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "Start with a recent past year paper",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "Past year exam paper collections",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "Recent past year exam papers",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "Are these past year exam papers free?",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "FAQPage",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "DownloadAction",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [
    ".output/public/past-year-exam-papers/index.html",
    'property="og:image" content="https://sgexamhub.com/og-image.png"',
  ],
  [
    ".output/public/test-papers/index.html",
    "Free Test Papers Singapore",
  ],
  [
    ".output/public/test-papers/index.html",
    "Singapore Primary Test Papers",
  ],
  [
    ".output/public/test-papers/index.html",
    "Download free Singapore primary test papers",
  ],
  [
    ".output/public/test-papers/index.html",
    "Start with a recent test paper",
  ],
  [
    ".output/public/test-papers/index.html",
    "Choose a test paper path",
  ],
  [
    ".output/public/test-papers/index.html",
    "Latest primary test papers",
  ],
  [
    ".output/public/test-papers/index.html",
    "Are these Singapore primary test papers free?",
  ],
  [
    ".output/public/test-papers/index.html",
    "FAQPage",
  ],
  [
    ".output/public/test-papers/index.html",
    "DownloadAction",
  ],
  [
    ".output/public/test-papers/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Top School Exam Papers Singapore",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Download free Singapore top school exam papers",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Start with a recent top school paper",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Choose a school collection",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Latest top school exam papers",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Are these top school exam papers free to download?",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Raffles Girls&#39; Primary School exam papers",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "Nanyang Primary School exam papers",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "FAQPage",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "DownloadAction",
  ],
  [
    ".output/public/top-school-exam-papers/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [
    ".output/public/exam-papers/index.html",
    "Singapore Primary Exam Papers PDF | Free Download",
  ],
  [
    ".output/public/exam-papers/index.html",
    "Download 2,299 free Singapore primary exam papers PDF files",
  ],
  [
    ".output/public/exam-papers/index.html",
    "Latest available in this collection: 2025 · 2,299 PDF papers",
  ],
  [
    ".output/public/exam-papers/index.html",
    "Open the newest paper, then download PDFs for timed revision.",
  ],
  [
    ".output/public/exam-papers/index.html",
    "Download PDF",
  ],
  [
    ".output/public/exam-papers/2025/index.html",
    "2025 Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025/index.html",
    "Latest available for 2026 revision. View online or download free PDFs.",
  ],
  [
    ".output/public/exam-papers/2025/index.html",
    "Year paper paths",
  ],
  [
    ".output/public/exam-papers/2025/index.html",
    "Start with 2025 primary exam papers",
  ],
  [
    ".output/public/exam-papers/2025/index.html",
    'href="/exam-papers/2025-primary-6"',
  ],
  [
    ".output/public/exam-papers/2025/index.html",
    'href="/exam-papers/2025-primary-6-mathematics"',
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "2025 Primary 6 Maths Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "View online or download free PDFs for PSLE revision.",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Latest available in this collection: 2025 · 12 PDF papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Best first step",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Open the newest paper, then download PDFs for timed revision.",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Start with recent papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Open one paper from this collection first",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Related exam paper collections",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Add a filter",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    'href="/exam-papers/2025-primary-6-mathematics-sa2"',
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    "Broader searches",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics/index.html",
    'name="twitter:card" content="summary_large_image"',
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics/index.html",
    "Primary 6 Maths Exam Papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics/index.html",
    "Subject revision path",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics/index.html",
    "Continue P6 Maths revision",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics/index.html",
    'href="/exam-papers/2025-primary-6-mathematics"',
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics/index.html",
    'href="/exam-papers/primary-6-science"',
  ],
  [
    ".output/public/exam-papers/2025-primary-6-sa2/index.html",
    "2025 Primary 6 SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "2025 Primary 6 Maths SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "View online or download free PDFs for PSLE revision.",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "Start with recent papers",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "PSLE practice focus",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "Use these Primary 6 papers before PSLE revision",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    "Are these 2025 Primary 6 Maths SA2 Exam Papers useful for PSLE revision?",
  ],
  [
    ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    'href="/exam-papers/primary-6-mathematics-sa2"',
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-sa2/index.html",
    "Primary 6 Maths SA2 Exam Papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-sa2/index.html",
    "Assessment practice path",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-sa2/index.html",
    "Compare P6 Maths assessment papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-sa2/index.html",
    'href="/exam-papers/primary-6-mathematics-wa2"',
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-school-nanyang-primary-school/index.html",
    "P6 Maths Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-school-nanyang-primary-school/index.html",
    "Compare school papers online, then download free PDFs for revision.",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-school-nanyang-primary-school/index.html",
    "School paper paths",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-school-nanyang-primary-school/index.html",
    "More Nanyang Primary School exam papers",
  ],
  [
    ".output/public/exam-papers/primary-6-mathematics-school-nanyang-primary-school/index.html",
    'href="/exam-papers/primary-6-science-school-nanyang-primary-school"',
  ],
  [
    ".output/public/exam-papers/primary-6-school-nanyang-primary-school/index.html",
    "P6 Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/primary-6-school-nanyang-primary-school/index.html",
    "School paper paths",
  ],
  [
    ".output/public/exam-papers/primary-6-school-nanyang-primary-school/index.html",
    'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
  ],
  [
    ".output/public/exam-papers/mathematics-school-nanyang-primary-school/index.html",
    "Maths Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/mathematics-school-nanyang-primary-school/index.html",
    "School paper paths",
  ],
  [
    ".output/public/exam-papers/mathematics-school-nanyang-primary-school/index.html",
    'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
  ],
  [
    ".output/public/exam-papers/sa2-school-nanyang-primary-school/index.html",
    "SA2 Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/sa2-school-nanyang-primary-school/index.html",
    "School paper paths",
  ],
  [
    ".output/public/exam-papers/sa2-school-nanyang-primary-school/index.html",
    'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
  ],
  [
    ".output/public/exam-papers/2025-sa2-school-nanyang-primary-school/index.html",
    "2025 SA2 Nanyang Primary School Exam Papers",
  ],
  [
    ".output/public/exam-papers/2025-sa2-school-nanyang-primary-school/index.html",
    "School paper paths",
  ],
  [
    ".output/public/exam-papers/2025-sa2-school-nanyang-primary-school/index.html",
    'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
  ],
  [
    ".output/public/sitemap/index.html",
    "Popular School Subject Collections",
  ],
  [
    ".output/public/sitemap/index.html",
    "Popular School Assessment Collections",
  ],
  [
    ".output/public/sitemap/index.html",
    "Popular Year School Assessment Collections",
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
    "View online or download free PDFs for Singapore primary timed practice.",
  ],
  [
    ".output/public/exam-papers/sa2/index.html",
    "Showing <strong",
  ],
  [
    ".output/public/exam-papers/sa2/index.html",
    "Show more papers",
  ],
  [
    ".output/public/exam-papers/sa2/index.html",
    "HowTo",
  ],
  [
    ".output/public/exam-papers/sa2/index.html",
    "HowToStep",
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
  [".output/public/view/6_1073_3_4_2025/index.html", "Free PDF Download"],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    "Free 2025 Raffles Girls' Primary School P6 Maths SA2 exam paper PDF",
  ],
  [".output/public/view/6_1073_3_4_2025/index.html", "isAccessibleForFree"],
  [".output/public/view/6_1073_3_4_2025/index.html", "DownloadAction"],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ],
  [".output/public/view/6_1073_3_4_2025/index.html", 'content="index, follow"'],
  [".output/public/view/6_1073_3_4_2025/index.html", "Download PDF"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Next paper to try"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Revision checklist"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Practice sequence"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Open one related paper after marking this PDF"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Download the PDF or open the next Primary 6 Maths paper"],
  [".output/public/view/6_1073_3_4_2025/index.html", "FAQPage"],
  [".output/public/view/6_1073_3_4_2025/index.html", "HowTo"],
  [".output/public/view/6_1073_3_4_2025/index.html", "HowToStep"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Using this paper"],
  [".output/public/view/6_1073_3_4_2025/index.html", "Continue revision"],
  [".output/public/view/6_1073_3_4_2025/index.html", "More Primary 6 Maths papers"],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    "Same school and assessment",
  ],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    'href="/exam-papers/2025-sa2-school-raffles-girls-primary-school"',
  ],
  [
    ".output/public/view/6_1073_3_4_2025/index.html",
    "2025 SA2 Raffles Girls",
  ],
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
if (weakSchoolNameRows.length) {
  fail(`Weak school-name casing in generated snippets: ${weakSchoolNameRows.length}`);
  for (const row of weakSchoolNameRows.slice(0, 20)) {
    console.error(`${row.url}: ${row.title} / ${row.description}`);
  }
}
if (onePaperPluralDescriptionRows.length) {
  fail(`One-paper descriptions use plural wording: ${onePaperPluralDescriptionRows.length}`);
  for (const row of onePaperPluralDescriptionRows.slice(0, 20)) {
    console.error(`${row.url}: ${row.description}`);
  }
}
if (missingCanonicalRows.length) {
  fail(`Missing canonical links: ${missingCanonicalRows.length}`);
  for (const row of missingCanonicalRows.slice(0, 20)) console.error(row);
}
if (mismatchedCanonicalRows.length) {
  fail(`Canonical URLs do not match generated routes: ${mismatchedCanonicalRows.length}`);
  for (const row of mismatchedCanonicalRows.slice(0, 20)) console.error(row);
}
if (mismatchedOgUrlRows.length) {
  fail(`Open Graph URLs do not match generated routes: ${mismatchedOgUrlRows.length}`);
  for (const row of mismatchedOgUrlRows.slice(0, 20)) console.error(row);
}
if (missingTwitterCardRows.length) {
  fail(`Missing large Twitter card metadata: ${missingTwitterCardRows.length}`);
  for (const row of missingTwitterCardRows.slice(0, 20)) console.error(row);
}
if (jsonLdFailures.length) {
  fail(`Invalid JSON-LD scripts: ${jsonLdFailures.length}`);
  for (const failure of jsonLdFailures.slice(0, 10)) console.error(failure);
}
if (missingLinks.length) {
  fail(`Missing internal links: ${missingLinks.length}`);
  for (const link of missingLinks.slice(0, 20)) console.error(link);
}
if (selfHostedPdfLinks.length) {
  fail(`Generated pages still link to self-hosted PDF files: ${selfHostedPdfLinks.length}`);
  for (const file of selfHostedPdfLinks.slice(0, 20)) console.error(file);
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
if (!sitemap.includes("https://sgexamhub.com/free-exam-papers")) {
  fail("Sitemap is missing the free exam papers landing page.");
}
if (!sitemap.includes("https://sgexamhub.com/past-year-exam-papers")) {
  fail("Sitemap is missing the past year exam papers landing page.");
}
if (!sitemap.includes("https://sgexamhub.com/test-papers")) {
  fail("Sitemap is missing the primary test papers landing page.");
}
if (!sitemap.includes("https://sgexamhub.com/top-school-exam-papers")) {
  fail("Sitemap is missing the top school exam papers landing page.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/2026-revision")) {
  fail("Sitemap is missing the 2026 revision landing page.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/psle-revision")) {
  fail("Sitemap is missing the PSLE revision landing page.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2")) {
  fail("Sitemap is missing representative level-subject-type route.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school")) {
  fail("Sitemap is missing representative school level-subject route.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/primary-6-school-nanyang-primary-school")) {
  fail("Sitemap is missing representative school level route.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/mathematics-school-nanyang-primary-school")) {
  fail("Sitemap is missing representative school subject route.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/sa2-school-nanyang-primary-school")) {
  fail("Sitemap is missing representative school assessment route.");
}
if (!sitemap.includes("https://sgexamhub.com/exam-papers/2025-sa2-school-nanyang-primary-school")) {
  fail("Sitemap is missing representative year school assessment route.");
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
if (!appShell.includes("send_page_view: false")) {
  fail("Global app shell must disable automatic GA4 page_view duplication.");
}
for (const snippet of [
  "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true",
  'node-version: "24"',
  "actions/checkout@v5",
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
for (const eventName of ["page_view", "paper_view_click", "paper_open", "paper_download"]) {
  if (!analytics.includes(eventName)) {
    fail(`Analytics helper is missing ${eventName}.`);
  }
}
for (const snippet of [
  "sg_exam_hub_attribution",
  "landing_path",
  "referrer_host",
  "is_google_referrer",
  "trackPageView",
  "page_location",
  "page_path",
  "page_title",
  "window.sessionStorage",
  "/(^|\\.)google\\./i",
]) {
  if (!analytics.includes(snippet)) {
    fail(`Analytics helper is missing attribution snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "page_engaged_time",
  "page_scroll_depth",
  "page_session_summary",
  'trackPageView("initial_load")',
  'trackPageView("route_change")',
  "max_scroll_percent",
  "window.setTimeout(() => sendEngagedTime(10), 10000)",
  "window.setTimeout(() => sendEngagedTime(120), 120000)",
  "for (const threshold of [25, 50, 75, 90])",
  'sendPageSummary("route_change")',
  'sendPageSummary("pagehide")',
]) {
  if (!engagement.includes(snippet)) {
    fail(`Engagement tracking is missing expected snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "2026 Primary Exam Papers Revision",
  "PSLE Revision Papers",
  "Free Exam Papers Singapore",
  "/free-exam-papers",
  "Past Year Exam Papers Singapore",
  "/past-year-exam-papers",
  "Singapore Primary Test Papers",
  "/test-papers",
  "Top School Exam Papers Singapore",
  "/top-school-exam-papers",
  "paperSearchQuery",
  "trackPaperSearch",
  "paper_search",
  "Search papers",
  "homeAnalyticsContext",
  "trackHomePaperView",
  "trackHomePaperDownload",
  "trackHeroPaperView",
  "trackHeroPaperDownload",
  "home_hero_cta",
  "search_query",
  "buildSocialMeta",
  "SearchAction",
  "search_term_string",
  "buildPdfFileUrl",
]) {
  if (!homePage.includes(snippet)) {
    fail(`Homepage is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "https://sgexamhub.com/free-exam-papers",
  "https://sgexamhub.com/past-year-exam-papers",
  "https://sgexamhub.com/test-papers",
  "https://sgexamhub.com/top-school-exam-papers",
  "https://sgexamhub.com/exam-papers/2026-revision",
  "https://sgexamhub.com/exam-papers/psle-revision",
  "https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2",
  "https://sgexamhub.com/exam-papers/2025-primary-6-science-sa2",
  "past year exam papers singapore",
  "singapore primary past year exam papers",
  "free test papers singapore",
  "top school exam papers singapore",
  "2026 primary exam papers",
  "psle revision papers",
  "psle practice papers",
  "Landing page is `/`, `/free-exam-papers`, `/past-year-exam-papers`, `/test-papers`, `/top-school-exam-papers`, or starts with `/exam-papers`.",
  "Event name is `page_view`, `paper_view_click`, `paper_open`, `paper_download`, `page_engaged_time`, `page_scroll_depth`, or `page_session_summary`.",
  "Custom event parameter `page_path` shows the current page after direct landings and SPA route changes.",
]) {
  if (!seoRunbook.includes(snippet)) {
    fail(`SEO runbook is missing expected GSC/GA4 snippet: ${snippet}`);
  }
}
for (const snippet of [
  "Free Exam Papers Singapore",
  "free exam papers Singapore",
  "freePaperCollections",
  "trackFreePaperView",
  "trackFreePaperDownload",
  "free_exam_papers_hero",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]) {
  if (!freeExamPapersPage.includes(snippet)) {
    fail(`Free exam papers page is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "Past Year Exam Papers Singapore",
  "past year exam papers",
  "pastYearCollections",
  "trackPastYearPaperView",
  "trackPastYearPaperDownload",
  "past_year_hero",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]) {
  if (!pastYearPage.includes(snippet)) {
    fail(`Past year exam papers page is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "Free Test Papers Singapore",
  "Singapore Primary Test Papers",
  "primary school test papers",
  "testPaperCollections",
  "trackTestPaperView",
  "trackTestPaperDownload",
  "test_papers_hero",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]) {
  if (!testPaperPage.includes(snippet)) {
    fail(`Test papers page is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "Top School Exam Papers Singapore",
  "top school exam papers",
  "topSchoolCollections",
  "trackTopSchoolPaperView",
  "trackTopSchoolPaperDownload",
  "top_school_hero",
  "Raffles Girls' Primary School",
  "Nanyang Primary School",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]) {
  if (!topSchoolPage.includes(snippet)) {
    fail(`Top school page is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "2026 Primary Exam Papers Revision",
  "latest available 2025 and 2024",
  "revisionCollections",
  "trackRevisionPaperView",
  "trackRevisionPaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]) {
  if (!revisionPage.includes(snippet)) {
    fail(`2026 revision page is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "PSLE Practice Papers | Primary 6 Revision PDFs",
  "PSLE Revision Papers",
  "PSLE practice papers from Primary 6",
  "psleCollections",
  "trackPslePaperView",
  "trackPslePaperDownload",
  "FAQPage",
  "DownloadAction",
  "buildPdfFileUrl",
]) {
  if (!pslePage.includes(snippet)) {
    fail(`PSLE revision page is missing expected source snippet: ${snippet}.`);
  }
}
for (const snippet of [
  "collectionAnalyticsContext",
  "page_slug",
  "page_path",
  "trackCollectionPaperView",
  "trackCollectionPaperDownload",
  "trackCollectionHeroPaperView",
  "trackCollectionHeroPaperDownload",
  "collection_hero_cta",
  "visiblePapers",
  "canShowMore",
  "showMorePapers",
  "paper_show_more",
  "Show more papers",
  "HowTo",
  "HowToStep",
  "paperSearchQuery",
  "trackCollectionPaperSearch",
  "index_search",
  "Search papers",
  "search_query",
  "buildSocialMeta",
  "buildPdfFileUrl",
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
  "trackViewerRelatedPaperDownload",
  "viewer_${section}_download",
  "target_paper_id",
  "related_section",
  "buildSocialMeta",
  "buildPdfFileUrl",
  "URL.createObjectURL",
  "pdfObjectUrl",
  "viewerFaqItems",
  "Using this paper",
  "FAQPage",
  "HowTo",
  "HowToStep",
  "revisionChecklistItems",
  "Revision checklist",
  "Free PDF Download",
  "paperLabel",
  "PSLE revision practice",
  "practiceSetLinks",
  "Continue revision",
  "nextPracticePaper",
  "next_paper",
  "viewer_collection_click",
  "trackViewerCollectionClick",
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
