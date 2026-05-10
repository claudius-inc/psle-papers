import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const siteUrl = "https://sgexamhub.com";

const urlInspectionPriority = [
  "/",
  "/sitemap.xml",
  "/exam-papers/",
  "/free-exam-papers/",
  "/past-year-exam-papers/",
  "/test-papers/",
  "/top-school-exam-papers/",
  "/exam-papers/2026-revision/",
  "/exam-papers/psle-revision/",
  "/exam-papers/2025/",
  "/exam-papers/2024/",
  "/exam-papers/chinese/",
  "/exam-papers/primary-3/",
  "/exam-papers/primary-3-chinese/",
  "/exam-papers/primary-3-science/",
  "/exam-papers/primary-3-higher-chinese/",
  "/exam-papers/2025-primary-6-sa2/",
  "/exam-papers/2025-primary-6-mathematics-sa2/",
  "/exam-papers/2025-primary-6-science-sa2/",
  "/exam-papers/primary-6-mathematics-school-nanyang-primary-school/",
  "/exam-papers/school-anglo-chinese-school-primary/",
  "/exam-papers/school-anglo-chinese-school-junior/",
  "/exam-papers/school-methodist-girls-school-primary/",
  "/exam-papers/school-raffles-girls-primary-school/",
  "/view/6_1073_3_4_2025/",
];

const searchRecheckQueries = [
  "site:sgexamhub.com sg exam papers",
  'site:sgexamhub.com "2,200+Papers"',
  'site:sgexamhub.com "2,300+"',
  'site:sgexamhub.com "free exam papers singapore"',
  'site:sgexamhub.com "psle revision papers"',
  'site:sgexamhub.com "Anglo chinese"',
  'site:sgexamhub.com "primary 3 chinese exam papers"',
  'site:sgexamhub.com "Primary 3 Chinese Exam Papers Free PDF Download"',
  'site:sgexamhub.com "Anglo-Chinese School (Primary)" "Download PDF"',
  'site:sgexamhub.com "Methodist Girls\' School (Primary)" "Download PDF"',
  'site:sgexamhub.com "Raffles Girls\' Primary School" "Download PDF"',
];

const gscQueryClusters = [
  "sg exam papers",
  "singapore primary school exam papers",
  "free exam papers singapore",
  "past year exam papers singapore",
  "primary 3 chinese exam papers",
  "chinese exam papers",
  "psle revision papers",
  "2025 primary 6 maths sa2 exam papers",
  "anglo chinese school primary exam papers",
  "methodist girls school primary exam papers",
  "nanyang primary p6 maths exam papers",
  "raffles girls primary school exam papers",
];

const ga4Events = [
  "page_engaged_time",
  "page_scroll_depth",
  "page_session_summary",
  "paper_view_click",
  "paper_open",
  "paper_pdf_load",
  "paper_download",
  "file_download",
];

const googleSearchUrl = (query) =>
  `https://www.google.com/search?q=${encodeURIComponent(query)}`;

const csvEscape = (value) => {
  const stringValue = String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseCsv = (path) => {
  if (!existsSync(path)) return [];

  const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
};

const existingUrlInspectionRows = new Map(
  parseCsv("reports/seo/gsc-url-inspection-tracker.csv")
    .filter((row) => row.url)
    .map((row) => [row.url, row]),
);

const existingSnippetRows = new Map(
  parseCsv("reports/seo/google-snippet-recheck-tracker.csv")
    .filter((row) => row.query)
    .map((row) => [row.query, row]),
);

const trackerRows = [
  [
    "Priority",
    "URL",
    "GSC live test result",
    "Indexing requested at",
    "Google result rechecked at",
    "Status",
    "Notes",
  ],
  ...urlInspectionPriority.map((path, index) => [
    index + 1,
    `${siteUrl}${path}`,
    existingUrlInspectionRows.get(`${siteUrl}${path}`)?.["gsc live test result"] || "",
    existingUrlInspectionRows.get(`${siteUrl}${path}`)?.["indexing requested at"] || "",
    existingUrlInspectionRows.get(`${siteUrl}${path}`)?.["google result rechecked at"] || "",
    existingUrlInspectionRows.get(`${siteUrl}${path}`)?.status || "Pending",
    existingUrlInspectionRows.get(`${siteUrl}${path}`)?.notes || "",
  ]),
];

const snippetTrackerRows = [
  [
    "Query",
    "Google search URL",
    "Checked at",
    "Stale snippet found",
    "Status",
    "Notes",
  ],
  ...searchRecheckQueries.map((query) => [
    query,
    googleSearchUrl(query),
    existingSnippetRows.get(query)?.["checked at"] || "",
    existingSnippetRows.get(query)?.["stale snippet found"] || "",
    existingSnippetRows.get(query)?.status || "Pending",
    existingSnippetRows.get(query)?.notes || "",
  ]),
];

const lines = [
  "# SEO Reindex And Outcome Action Pack",
  "",
  "Generated from source. Use this after the latest GitHub Pages deployment has passed `npm run seo:audit:live`.",
  "",
  "Use this file as the operational handoff after the live site passes SEO audits. It does not replace Google Search Console or GA4; it lists the exact external actions and evidence needed before the SEO goal can be considered complete.",
  "",
  "## Preconditions",
  "",
  "- Latest relevant GitHub Pages run passed build and deploy.",
  "- Latest relevant deployed SEO commit is the commit being submitted for URL Inspection.",
  "- Live audit gate: `npm run seo:audit:live` passed for the latest deployment.",
  "- Public Google results were still stale after deployment, so URL Inspection and sitemap resubmission remain required.",
  "",
  "## Google Search Console URL Inspection",
  "",
  "Inspect each URL below in Google Search Console. When the live test shows the current page, click `Request indexing`.",
  "",
  "Track completion in `reports/seo/gsc-url-inspection-tracker.csv` so the remaining manual indexing work has dated evidence.",
  "",
  ...urlInspectionPriority.map((path, index) => `${index + 1}. ${siteUrl}${path}`),
  "",
  "After URL Inspection requests, resubmit this sitemap in the GSC Sitemaps report:",
  "",
  `${siteUrl}/sitemap.xml`,
  "",
  "## Public Google Recheck Queries",
  "",
  "Run these checks 24-72 hours after URL Inspection requests, then again after 7 days.",
  "",
  "Track freshness in `reports/seo/google-snippet-recheck-tracker.csv` so stale public search results do not get mistaken for completion.",
  "",
  ...searchRecheckQueries.map(
    (query) => `- ${query}\n  ${googleSearchUrl(query)}`,
  ),
  "",
  "Freshness pass criteria:",
  "",
  "- No SG Exam Hub result shows stale `2,200+Papers`, `2,200+`, or `2,300+` count copy.",
  "- No priority result shows stale school casing such as `Anglo chinese`, `Methodist Girls' School (primary)`, or `Chij (katong) Primary`.",
  "- Priority snippets emphasize free PDF viewing/downloads rather than old paper-list UI text.",
  "",
  "## GSC Outcome Export",
  "",
  "Export GSC Performance data for a baseline period and a matching comparison period after Google has recrawled.",
  "",
  "Track these query clusters:",
  "",
  ...gscQueryClusters.map((query) => `- ${query}`),
  "",
  "Required GSC columns:",
  "",
  "- Query",
  "- Page",
  "- Clicks",
  "- Impressions",
  "- CTR",
  "- Position",
  "",
  "## GA4 Organic Outcome Export",
  "",
  "Export organic search events filtered to Organic Search traffic or `is_google_referrer = true`.",
  "",
  "Required event groups:",
  "",
  ...ga4Events.map((eventName) => `- ${eventName}`),
  "",
  "Priority landing pages:",
  "",
  ...[
    "/",
    "/free-exam-papers",
    "/past-year-exam-papers",
    "/test-papers",
    "/top-school-exam-papers",
    "/exam-papers/2026-revision",
    "/exam-papers/psle-revision",
    "/exam-papers/primary-3-chinese",
    "/exam-papers/chinese",
  ].map((path) => `- ${siteUrl}${path}`),
  "",
  "## Outcome Analyzer Command",
  "",
  "If the export CSVs do not exist yet, generate templates first:",
  "",
  "```sh",
  "npm run seo:export-templates",
  "```",
  "",
  "Run this after the GSC and GA4 exports are available:",
  "",
  "```sh",
  "npm run seo:outcomes -- \\",
  "  --gsc-before reports/seo/gsc-before.csv \\",
  "  --gsc-after reports/seo/gsc-after.csv \\",
  "  --ga4 reports/seo/ga4-organic-events.csv \\",
  "  --out reports/seo/outcome-report.md",
  "```",
  "",
  "## Completion Rule",
  "",
  "Do not mark the SEO objective complete until public Google snippets are refreshed and the outcome analyzer passes on real GSC/GA4 exports.",
  "",
];

mkdirSync("reports/seo", { recursive: true });
writeFileSync("reports/seo/reindex-action-pack.md", `${lines.join("\n")}\n`);
writeFileSync(
  "reports/seo/gsc-url-inspection-tracker.csv",
  `${trackerRows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`,
);
writeFileSync(
  "reports/seo/google-snippet-recheck-tracker.csv",
  `${snippetTrackerRows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`,
);
console.log("Wrote reports/seo/reindex-action-pack.md");
console.log("Wrote reports/seo/gsc-url-inspection-tracker.csv");
console.log("Wrote reports/seo/google-snippet-recheck-tracker.csv");
