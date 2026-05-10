const siteUrl = "https://sgexamhub.com";

const staleHomepageSnippets = [
  "totalPaperCountRounded",
  "2,200+",
  "2,200 +",
  "2,300+",
];

const homepagePriorityDirectorySnippets = [
  "Primary 6 Chinese Exam Papers",
  "Primary 5 English Exam Papers",
  "Primary 5 Chinese Exam Papers",
  "Primary 4 Science Exam Papers",
  "Primary 4 English Exam Papers",
  "Primary 4 Chinese Exam Papers",
  "Primary 3 Maths Exam Papers",
  "Primary 3 Science Exam Papers",
  "Primary 3 English Exam Papers",
  "Primary 3 Chinese Exam Papers",
  "Primary 3 Higher Chinese Exam Papers",
  "Primary 6 English SA2 Exam Papers",
  "Primary 6 Chinese SA2 Exam Papers",
];

const broadLandingPages = [
  {
    path: "/free-exam-papers/",
    title: "Free Exam Papers Singapore",
  },
  {
    path: "/past-year-exam-papers/",
    title: "Past Year Exam Papers Singapore",
  },
  {
    path: "/test-papers/",
    title: "Singapore Primary Test Papers",
  },
  {
    path: "/top-school-exam-papers/",
    title: "Top School Exam Papers Singapore",
  },
];

const checks = [
  {
    path: "/",
    snippets: [
      "data-nosnippet",
      'class="content-wrapper seo-links" aria-labelledby="latest-papers" data-nosnippet',
      "hero-paper-cta",
      "SG Exam Hub: Free Singapore Primary Exam Papers",
      "No sign-up needed",
      "2,299 PDF exam papers indexed",
      ...homepagePriorityDirectorySnippets,
    ],
    patterns: [/class="hero-paper-cta"[^>]*data-nosnippet/s],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: "/og-image.svg",
    snippets: [
      "2,299 PDF papers",
      "Free download",
    ],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: "/exam-papers/",
    snippets: [
      "data-nosnippet",
      "collection-action-strip",
      "starter-section",
      "mobile-collection-action-bar",
      "Singapore Primary Exam Papers PDF | Free Download",
      "No sign-up needed",
    ],
    patterns: [
      /class="collection-action-strip"[^>]*data-nosnippet/s,
      /class="starter-section"[^>]*data-nosnippet/s,
      /class="mobile-collection-action-bar"[^>]*data-nosnippet/s,
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics-sa2/",
    snippets: [
      "data-nosnippet",
      "collection-action-strip",
      "starter-section",
      "mobile-collection-action-bar",
      "2025 Primary 6 Maths SA2 Exam Papers",
      "Download PDF",
    ],
    patterns: [
      /class="collection-action-strip"[^>]*data-nosnippet/s,
      /class="starter-section"[^>]*data-nosnippet/s,
      /class="mobile-collection-action-bar"[^>]*data-nosnippet/s,
    ],
  },
  ...broadLandingPages.map((page) => ({
    path: page.path,
    snippets: [
      "data-nosnippet",
      "hero-card",
      "paper-section",
      page.title,
      "Download PDF",
    ],
    patterns: [
      /class="hero-card"[^>]*data-nosnippet/s,
      /class="content-wrapper paper-section"[^>]*data-nosnippet/s,
    ],
  })),
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
    for (const pattern of check.patterns || []) {
      if (!pattern.test(html)) {
        fail(`Live ${check.path} is missing snippet-focused UI pattern: ${pattern}`);
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
