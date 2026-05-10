const siteUrl = "https://sgexamhub.com";
const gaMeasurementId = "G-7WKP91PV8C";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveConversionAnalyticsAudit/1.0",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
};

const assertIncludes = (content, snippets, label) => {
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      fail(`${label} is missing conversion analytics snippet: ${snippet}`);
    }
  }
};

const extractNuxtAssetUrls = (html) => {
  const matches = html.matchAll(/(?:src|href)="(\/_nuxt\/[^"?#]+\.(?:js|mjs|json))"/g);
  return [...new Set([...matches].map((match) => `${siteUrl}${match[1]}`))];
};

try {
  const pages = [
    "/",
    "/download-exam-papers/",
    "/free-exam-papers/",
    "/past-year-exam-papers/",
    "/test-papers/",
    "/top-school-exam-papers/",
    "/exam-papers/2026-revision/",
    "/exam-papers/psle-revision/",
    "/exam-papers/2025-primary-6-mathematics/",
    "/view/6_1073_3_4_2025",
  ];
  const pageHtml = await Promise.all(
    pages.map(async (path) => ({
      path,
      html: await fetchText(`${siteUrl}${path}`),
    })),
  );
  const html = pageHtml.find((page) => page.path === "/")?.html || "";
  assertIncludes(
    html,
    [
      `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
      "window.dataLayer = window.dataLayer || [];",
      `gtag('config', '${gaMeasurementId}', { send_page_view: false });`,
    ],
    "Live homepage",
  );

  const assetUrls = [
    ...new Set(pageHtml.flatMap((page) => extractNuxtAssetUrls(page.html))),
  ];
  const assetContents = await Promise.all(
    assetUrls.map(async (assetUrl) => ({
      assetUrl,
      content: await fetchText(assetUrl),
    })),
  );
  const bundledApp = assetContents.map((asset) => asset.content).join("\n");

  assertIncludes(
    bundledApp,
    [
      "sg_exam_hub_attribution",
      "landing_path",
      "referrer_host",
      "is_google_referrer",
      "transport_type",
      "beacon",
      "paper_view_click",
      "paper_open",
      "paper_search",
      "view_search_results",
      "search_term",
      "empty_search_recovery_click",
      "paper_pdf_load",
      "paper_pdf_error",
      "pdf_load_ms",
      "pdf_status",
      "paper_download",
      "file_download",
      "file_name",
      "file_extension",
      "link_url",
      "is_conversion_event",
      "page_engaged_time",
      "page_scroll_depth",
      "page_session_summary",
      "download_exam_collection_click",
      "download_exam_collection_grid",
      "free_exam_collection_click",
      "free_exam_collection_grid",
      "past_year_collection_click",
      "past_year_collection_grid",
      "test_paper_collection_click",
      "test_paper_collection_grid",
      "top_school_collection_click",
      "top_school_collection_grid",
      "revision_collection_click",
      "revision_collection_grid",
      "psle_collection_click",
      "psle_collection_grid",
      "psle_school_grid",
      "related_collection_click",
      "collection_related_collections",
      "viewer_collection_click",
      "collection_title",
      "target_path",
      "school_name",
      "collection_hero_cta",
      "collection_mobile_sticky",
      "matchMedia",
      "max-width: 640px",
    ],
    "Live Nuxt assets",
  );

  console.log(`Live conversion analytics audit checked ${pages.length} pages and ${assetUrls.length} assets.`);
  if (process.exitCode) process.exit();
  console.log("Live conversion analytics audit passed.");
} catch (error) {
  fail(`Live conversion analytics audit failed: ${error.message}`);
  process.exit();
}
