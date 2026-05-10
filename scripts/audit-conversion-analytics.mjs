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
  home,
  [
    "trackHomePaperView",
    "trackHomePaperDownload",
    "trackFilterChange",
    'trackEvent("paper_show_more"',
    'trackEvent("paper_search"',
  ],
  "homepage is missing required paper discovery analytics",
);

assertIncludes(
  packageJson.scripts?.["seo:audit"] || "",
  ["node scripts/audit-conversion-analytics.mjs"],
  "seo:audit script is missing the conversion analytics gate",
);

if (process.exitCode) process.exit();
console.log("Conversion analytics audit passed.");
