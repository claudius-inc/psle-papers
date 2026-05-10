const siteUrl = "https://sgexamhub.com";

const checks = [
  {
    path: "/",
    snippets: [
      "data-nosnippet",
      "SG Exam Hub: Free Singapore Primary Exam Papers",
      "No sign-up needed",
      "2,299 PDF exam papers indexed",
    ],
    forbiddenSnippets: [
      "totalPaperCountRounded",
      "2,200+",
      "2,200 +",
    ],
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
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "")
    .replace(/&nbsp;/g, "");

try {
  for (const check of checks) {
    const html = await fetchText(`${siteUrl}${check.path}`);
    const compactHtml = normalizeForSnippetChecks(html);

    for (const snippet of check.snippets) {
      if (!html.includes(snippet)) {
        fail(`Live ${check.path} is missing snippet-focused UI snippet: ${snippet}`);
      }
    }
    for (const snippet of check.forbiddenSnippets || []) {
      const compactSnippet = normalizeForSnippetChecks(snippet);
      if (html.includes(snippet) || compactHtml.includes(compactSnippet)) {
        fail(`Live ${check.path} contains stale snippet-focused UI copy: ${snippet}`);
      }
    }
  }

  console.log(`Live snippet-focused UI audit checked ${checks.length} pages.`);
  if (process.exitCode) process.exit();
  console.log("Live snippet-focused UI audit passed.");
} catch (error) {
  fail(`Live snippet-focused UI audit failed: ${error.message}`);
  process.exit();
}
