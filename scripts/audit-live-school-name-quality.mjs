const siteUrl = "https://sgexamhub.com";

const pages = [
  {
    label: "homepage",
    path: "/",
    expected: [
      "Anglo-Chinese School (Junior)",
      "Methodist Girls&#39; School (Primary)",
    ],
  },
  {
    label: "P3 Chinese collection",
    path: "/exam-papers/primary-3-chinese",
    expected: [
      "Anglo-Chinese School (Primary)",
      "Methodist Girls&#39; School (Primary)",
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
];

const staleSnippets = [
  "Anglo chinese School",
  "Anglo Chinese School",
  "Methodist Girls&#39; School (primary)",
  "Methodist Girls' School (primary)",
  "CHIJ St Nicholas Girls' School",
  "Chij ",
  "Chij (",
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

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
    pages.map(async (page) => ({
      ...page,
      html: await fetchText(`${siteUrl}${page.path}`),
    })),
  );

  for (const page of pageResults) {
    for (const snippet of page.expected) {
      if (!page.html.includes(snippet)) {
        fail(`Live ${page.label} is missing official school-name snippet: ${snippet}`);
      }
    }

    for (const staleSnippet of staleSnippets) {
      if (page.html.includes(staleSnippet)) {
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
