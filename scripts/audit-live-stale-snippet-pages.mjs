const siteUrl = "https://sgexamhub.com";

const checks = [
  {
    path: "/",
    required: [
      "SG Exam Hub: Free Singapore Primary Exam Papers | 2026",
      "No sign-up needed",
      "2,299 PDF exam papers indexed",
      "Download PDF",
      "SearchAction",
    ],
    forbidden: ["2,200+", "2,300+", "Anglo chinese", "Methodist Girls' School (primary)"],
  },
  {
    path: "/exam-papers/primary-3-chinese/",
    required: [
      "Primary 3 Chinese Exam Papers Free PDF Download",
      "View online or download free PDFs",
      "Download PDF",
      "Anglo-Chinese School (Primary)",
      "Methodist Girls' School (Primary)",
      "CHIJ Katong Primary",
      "CollectionPage",
      "DownloadAction",
      "HowTo",
    ],
    forbidden: ["P3 Chinese exam papers", "Anglo chinese", "Methodist Girls' School (primary)", "Chij (katong) Primary"],
  },
  {
    path: "/exam-papers/primary-3/",
    required: [
      "Primary 3 Exam Papers Free PDF Download",
      "View online or download free PDFs",
      "Download PDF",
      "CollectionPage",
      "DownloadAction",
    ],
    forbidden: ["P3 exam papers", "Anglo chinese", "Methodist Girls' School (primary)", "Chij"],
  },
  {
    path: "/exam-papers/chinese/",
    required: [
      "Primary Chinese Exam Papers Singapore | Free PDF Download",
      "Download 411 free Singapore primary Chinese exam papers",
      "Download PDF",
      "CollectionPage",
      "DownloadAction",
    ],
    forbidden: ["Anglo chinese", "Methodist Girls' School (primary)", "Chij (katong) Primary"],
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveStaleSnippetAudit/1.0",
    },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
};

for (const check of checks) {
  const html = await fetchText(`${siteUrl}${check.path}`);

  for (const snippet of check.required) {
    if (!html.includes(snippet)) {
      fail(`Live ${check.path} is missing refreshed snippet: ${snippet}`);
    }
  }

  for (const snippet of check.forbidden) {
    if (html.includes(snippet)) {
      fail(`Live ${check.path} still contains stale snippet: ${snippet}`);
    }
  }
}

console.log(`Live stale-snippet page audit checked ${checks.length} pages.`);
if (process.exitCode) process.exit();
console.log("Live stale-snippet page audit passed.");
