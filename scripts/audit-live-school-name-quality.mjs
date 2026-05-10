const siteUrl = "https://sgexamhub.com";

const pages = [
  {
    label: "homepage",
    path: "/",
    expected: [
      "Anglo-Chinese School (Junior)",
      "Methodist Girls' School (Primary)",
    ],
  },
  {
    label: "P3 Chinese collection",
    path: "/exam-papers/primary-3-chinese",
    expected: [
      "Anglo-Chinese School (Primary)",
      "Methodist Girls' School (Primary)",
      "CHIJ Katong Primary",
    ],
  },
  {
    label: "ACS Primary collection",
    path: "/exam-papers/school-anglo-chinese-school-primary",
    expected: [
      "Anglo-Chinese School (Primary)",
      "Anglo-Chinese School (Primary) Exam Papers",
    ],
  },
  {
    label: "viewer practice sequence",
    path: "/view/6_1073_3_4_2025",
    expected: [
      "Raffles Girls' Primary School",
      "Methodist Girls' School (Primary) P6 Mathematics SA2",
      "Open next related paper",
      "Practice sequence",
    ],
  },
];

const staleSnippets = [
  "Anglo chinese School",
  "Anglo Chinese School",
  "Methodist Girls' School (primary)",
  "Methodist Girls' School (Primary)P6",
  "CHIJ St Nicholas Girls' School",
  "Chij ",
  "Chij (",
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const decodeHtmlEntities = (value) =>
  value
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

const normalizeVisibleText = (html) =>
  decodeHtmlEntities(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveSchoolNameAudit/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
};

try {
  const pageResults = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchText(`${siteUrl}${page.path}`);
      return {
        ...page,
        html,
        text: normalizeVisibleText(html),
      };
    }),
  );

  for (const page of pageResults) {
    for (const snippet of page.expected) {
      if (!page.text.includes(snippet) && !page.html.includes(snippet)) {
        fail(`Live ${page.label} is missing official school-name snippet: ${snippet}`);
      }
    }

    for (const staleSnippet of staleSnippets) {
      if (page.text.includes(staleSnippet) || page.html.includes(staleSnippet)) {
        fail(`Live ${page.label} contains stale school-name snippet: ${staleSnippet}`);
      }
    }
  }

  if (process.exitCode) process.exit();
  console.log("Live school name quality audit passed.");
} catch (error) {
  fail(`Live school name quality audit failed: ${error.message}`);
  process.exit();
}
