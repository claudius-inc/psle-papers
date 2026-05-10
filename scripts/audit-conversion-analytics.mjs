import { existsSync, readFileSync } from "node:fs";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const readRequiredFile = (path) => {
  if (!existsSync(path)) {
    fail(`Missing required file: ${path}`);
    process.exit();
  }
  return readFileSync(path, "utf8");
};

const assertIncludes = (content, snippets, messagePrefix) => {
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      fail(`${messagePrefix}: ${snippet}`);
    }
  }
};

const packageJson = JSON.parse(readRequiredFile("package.json"));
const app = readRequiredFile("app/app.vue");
const analytics = readRequiredFile("app/utils/analytics.ts");
const engagement = readRequiredFile("app/composables/useEngagementTracking.ts");
const viewer = readRequiredFile("app/pages/view/[id].vue");
const home = readRequiredFile("app/pages/index.vue");
const downloadExamPapers = readRequiredFile("app/pages/download-exam-papers.vue");
const freeExamPapers = readRequiredFile("app/pages/free-exam-papers.vue");
const pastYearExamPapers = readRequiredFile("app/pages/past-year-exam-papers.vue");
const testPapers = readRequiredFile("app/pages/test-papers.vue");
const topSchoolExamPapers = readRequiredFile("app/pages/top-school-exam-papers.vue");
const revision2026 = readRequiredFile("app/pages/exam-papers/2026-revision.vue");
const psleRevision = readRequiredFile("app/pages/exam-papers/psle-revision.vue");
const collectionPage = readRequiredFile("app/pages/exam-papers/[[slug]].vue");
const outcomeAnalyzer = readRequiredFile("scripts/analyze-seo-outcomes.mjs");

assertIncludes(
  app,
  [
    "useEngagementTracking();",
    "https://www.googletagmanager.com/gtag/js?id=G-7WKP91PV8C",
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('config', 'G-7WKP91PV8C', { send_page_view: false });",
  ],
  "app.vue is missing required GA4 tag or global engagement tracking setup",
);

assertIncludes(
  analytics,
  [
    'const attributionStorageKey = "sg_exam_hub_attribution"',
    "window.sessionStorage.getItem(attributionStorageKey)",
    "landing_path:",
    "referrer_host:",
    "is_google_referrer:",
    'transport_type: "beacon"',
    "getResponsiveSource",
    'source === "collection_hero_cta"',
    '"collection_mobile_sticky"',
    "window.matchMedia(\"(max-width: 640px)\").matches",
    'trackEvent("paper_view_click"',
    'trackEvent("paper_open"',
    "trackSiteSearch",
    'trackEvent("search"',
    'trackEvent("view_search_results"',
    "search_term",
    'trackEvent("paper_download"',
    'trackEvent("file_download"',
    "file_name:",
    'file_extension: "pdf"',
    "link_url:",
    "is_conversion_event: true",
  ],
  "analytics.ts is missing required SEO funnel attribution, mobile CTA source, or conversion transport",
);

assertIncludes(
  engagement,
  [
    'trackEvent("page_engaged_time"',
    'trackEvent("page_scroll_depth"',
    'trackEvent("page_session_summary"',
    'trackPageView("initial_load")',
    'trackPageView("route_change")',
  ],
  "engagement tracking is missing required organic-session depth events",
);

assertIncludes(
  viewer,
  [
    'trackViewerPaperOpen("viewer_page")',
    "trackViewerPaperDownload('viewer_top')",
    "trackViewerPaperDownload('viewer_panel')",
    "trackViewerPaperDownload('viewer_mobile_sticky')",
    'trackEvent("paper_pdf_load"',
    'trackEvent("paper_pdf_error"',
    "pdf_load_ms",
    "pdf_status",
    "trackViewerRelatedPaperView(item, 'practice_sequence')",
    "trackViewerRelatedPaperDownload(item, 'practice_sequence')",
    'trackEvent("viewer_collection_click"',
  ],
  "viewer page is missing required paper-open, download, or continuation analytics",
);

assertIncludes(
  downloadExamPapers,
  [
    'trackEvent("download_exam_collection_click"',
    "download_exam_collection_grid",
    "collection_title:",
    "target_path:",
  ],
  "download exam papers page is missing required collection-path analytics",
);

assertIncludes(
  freeExamPapers,
  [
    'trackEvent("free_exam_collection_click"',
    "free_exam_collection_grid",
    "collection_title:",
    "target_path:",
  ],
  "free exam papers page is missing required collection-path analytics",
);

assertIncludes(
  pastYearExamPapers,
  [
    'trackEvent("past_year_collection_click"',
    "past_year_collection_grid",
    "collection_title:",
    "target_path:",
  ],
  "past year exam papers page is missing required collection-path analytics",
);

assertIncludes(
  testPapers,
  [
    'trackEvent("test_paper_collection_click"',
    "test_paper_collection_grid",
    "collection_title:",
    "target_path:",
  ],
  "test papers page is missing required collection-path analytics",
);

assertIncludes(
  topSchoolExamPapers,
  [
    'trackEvent("top_school_collection_click"',
    "top_school_collection_grid",
    "school_name:",
    "target_path:",
  ],
  "top school page is missing required collection-path analytics",
);

assertIncludes(
  revision2026,
  [
    'trackEvent("revision_collection_click"',
    "revision_collection_grid",
    "collection_title:",
    "target_path:",
  ],
  "2026 revision page is missing required collection-path analytics",
);

assertIncludes(
  psleRevision,
  [
    'trackEvent("psle_collection_click"',
    "psle_collection_grid",
    "psle_school_grid",
    "collection_title:",
    "target_path:",
  ],
  "PSLE revision page is missing required collection-path analytics",
);

assertIncludes(
  collectionPage,
  [
    'trackEvent("related_collection_click"',
    "collection_related_collections",
    "related_group:",
    "related_path:",
    "related_title:",
  ],
  "collection page is missing required related-collection analytics",
);

assertIncludes(
  home,
  [
    "trackHomePaperView",
    "trackHomePaperDownload",
    "trackFilterChange",
    'trackEvent("paper_show_more"',
    "trackSiteSearch",
    '"home_url_query"',
    'query_source: "url_query"',
    'trackEvent("empty_search_recovery_click"',
  ],
  "homepage is missing required paper discovery analytics",
);

assertIncludes(
  outcomeAnalyzer,
  [
    "collectionPathClick",
    "download_exam_collection_click",
    "free_exam_collection_click",
    "past_year_collection_click",
    "test_paper_collection_click",
    "top_school_collection_click",
    "revision_collection_click",
    "psle_collection_click",
    "related_collection_click",
    "viewer_collection_click",
    "empty_search_recovery_click",
  ],
  "SEO outcome analyzer is missing required collection-path conversion evidence gate",
);

assertIncludes(
  packageJson.scripts?.["seo:audit"] || "",
  ["node scripts/audit-conversion-analytics.mjs"],
  "seo:audit script is missing the conversion analytics gate",
);

if (process.exitCode) process.exit();
console.log("Conversion analytics audit passed.");
