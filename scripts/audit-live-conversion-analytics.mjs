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
  const html = await fetchText(`${siteUrl}/`);
  assertIncludes(
    html,
    [
      `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
      "window.dataLayer = window.dataLayer || [];",
      `gtag('config', '${gaMeasurementId}', { send_page_view: false });`,
    ],
    "Live homepage",
  );

  const assetUrls = extractNuxtAssetUrls(html);
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
      "collection_hero_cta",
      "collection_mobile_sticky",
      "matchMedia",
      "max-width: 640px",
    ],
    "Live Nuxt assets",
  );

  console.log(`Live conversion analytics audit checked 1 page and ${assetUrls.length} assets.`);
  if (process.exitCode) process.exit();
  console.log("Live conversion analytics audit passed.");
} catch (error) {
  fail(`Live conversion analytics audit failed: ${error.message}`);
  process.exit();
}
