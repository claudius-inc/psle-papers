const siteUrl = "https://sgexamhub.com";

const checks = [
  {
    path: "/",
    snippets: ["SearchAction", "SiteNavigationElement", "DownloadAction"],
  },
  {
    path: "/free-exam-papers/",
    snippets: ["FAQPage", "DownloadAction"],
  },
  {
    path: "/past-year-exam-papers/",
    snippets: ["FAQPage", "DownloadAction"],
  },
  {
    path: "/test-papers/",
    snippets: ["FAQPage", "DownloadAction"],
  },
  {
    path: "/top-school-exam-papers/",
    snippets: ["FAQPage", "DownloadAction"],
  },
  {
    path: "/exam-papers/",
    snippets: ["CollectionPage", "DownloadAction"],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics-sa2/",
    snippets: ["BreadcrumbList", "CollectionPage", "HowTo", "HowToStep", "DownloadAction"],
  },
  {
    path: "/exam-papers/primary-3-chinese/",
    snippets: ["BreadcrumbList", "CollectionPage", "HowTo", "HowToStep", "DownloadAction"],
  },
  {
    path: "/exam-papers/psle-revision/",
    snippets: ["FAQPage", "DownloadAction"],
  },
  {
    path: "/exam-papers/2026-revision/",
    snippets: ["FAQPage", "DownloadAction"],
  },
  {
    path: "/view/6_1073_3_4_2025/",
    snippets: ["BreadcrumbList", "LearningResource", "FAQPage", "HowTo", "HowToStep", "DownloadAction"],
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const decodeHtml = (value) =>
  value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveJsonLdAudit/1.0",
    },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
};

const extractJsonLd = (html, path) => {
  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];

  if (!scripts.length) {
    fail(`Live ${path} has no JSON-LD script.`);
    return [];
  }

  return scripts.flatMap((match, index) => {
    const rawJson = decodeHtml(match[1]).trim();
    try {
      const parsed = JSON.parse(rawJson);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      fail(`Live ${path} has invalid JSON-LD script ${index + 1}: ${error.message}`);
      return [];
    }
  });
};

for (const check of checks) {
  const html = await fetchText(`${siteUrl}${check.path}`);
  const jsonLdItems = extractJsonLd(html, check.path);
  const jsonLdText = JSON.stringify(jsonLdItems);

  for (const snippet of check.snippets) {
    if (!jsonLdText.includes(snippet)) {
      fail(`Live ${check.path} JSON-LD is missing expected schema snippet: ${snippet}`);
    }
  }
}

console.log(`Live JSON-LD audit checked ${checks.length} pages.`);
if (process.exitCode) process.exit();
console.log("Live JSON-LD audit passed.");
