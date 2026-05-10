const siteUrl = "https://sgexamhub.com";

const staleHomepageSnippets = [
  "totalPaperCountRounded",
  "2,200+",
  "2,200 +",
];

const checks = [
  {
    path: "/",
    snippets: [
      "data-nosnippet",
      "SG Exam Hub: Free Singapore Primary Exam Papers",
      "No sign-up needed",
      "2,299 PDF exam papers indexed",
    ],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: "/exam-papers/",
    snippets: [
      "data-nosnippet",
      "Singapore Primary Exam Papers PDF | Free Download",
      "No sign-up needed",
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics-sa2/",
    snippets: [
      "data-nosnippet",
      "2025 Primary 6 Maths SA2 Exam Papers",
      "Download PDF",
    ],
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveSnippetFocusedUiAudit/1.0",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
};

const normalizeForSnippetChecks = (content) =>
  content
    .replace(/&nbsp;/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "");

const assertNoForbiddenSnippets = (content, forbiddenSnippets, label) => {
  const compactContent = normalizeForSnippetChecks(content);
  for (const snippet of forbiddenSnippets || []) {
    const compactSnippet = normalizeForSnippetChecks(snippet);
    if (content.includes(snippet) || compactContent.includes(compactSnippet)) {
      fail(`${label} contains stale snippet-focused UI copy: ${snippet}`);
    }
  }
};

const extractNuxtAssetUrls = (html) => {
  const matches = html.matchAll(/(?:src|href)="(\/_nuxt\/[^"?#]+\.(?:js|mjs|json))"/g);
  return [...new Set([...matches].map((match) => `${siteUrl}${match[1]}`))];
};

try {
  const assetUrls = new Set();

  for (const check of checks) {
    const html = await fetchText(`${siteUrl}${check.path}`);

    for (const snippet of check.snippets) {
      if (!html.includes(snippet)) {
        fail(`Live ${check.path} is missing snippet-focused UI snippet: ${snippet}`);
      }
    }
    assertNoForbiddenSnippets(html, check.forbiddenSnippets, `Live ${check.path}`);
    for (const assetUrl of extractNuxtAssetUrls(html)) assetUrls.add(assetUrl);
  }

  for (const assetUrl of assetUrls) {
    assertNoForbiddenSnippets(
      await fetchText(assetUrl),
      staleHomepageSnippets,
      `Live asset ${assetUrl}`,
    );
  }

  console.log(`Live snippet-focused UI audit checked ${checks.length} pages and ${assetUrls.size} assets.`);
  if (process.exitCode) process.exit();
  console.log("Live snippet-focused UI audit passed.");
} catch (error) {
  fail(`Live snippet-focused UI audit failed: ${error.message}`);
  process.exit();
}
