const siteUrl = "https://sgexamhub.com";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveBroadLandingAudit/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
};

const checks = [
  {
    path: "/past-year-exam-papers/",
    snippets: [
      "Past Year Exam Papers Singapore",
      "Download Singapore primary past year exam papers",
      "Choose a past year path",
      "Past year exam paper collections",
      "No sign-up needed",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
    collectionPaths: [
      "/exam-papers/2025",
      "/exam-papers/2024",
      "/exam-papers/primary-6",
      "/exam-papers/primary-6-mathematics-sa2",
      "/exam-papers/primary-6-science-sa2",
      "/top-school-exam-papers",
    ],
  },
  {
    path: "/test-papers/",
    snippets: [
      "Free Test Papers Singapore",
      "Singapore Primary Test Papers",
      "Download free Singapore primary test papers",
      "Choose a test paper path",
      "No sign-up needed",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
    collectionPaths: [
      "/exam-papers/2025",
      "/exam-papers/primary-6",
      "/exam-papers/primary-6-mathematics",
      "/exam-papers/primary-6-science",
      "/exam-papers/sa2",
      "/exam-papers/psle-revision",
    ],
  },
];

try {
  const sitemap = await fetchText(`${siteUrl}/sitemap.xml`);

  for (const check of checks) {
    const html = await fetchText(`${siteUrl}${check.path}`);

    for (const snippet of check.snippets) {
      if (!html.includes(snippet)) {
        fail(`Live ${check.path} is missing expected snippet: ${snippet}`);
      }
    }

    for (const path of check.collectionPaths) {
      if (!html.includes(`href="${path}"`)) {
        fail(`Live ${check.path} is missing collection link: ${path}`);
      }
      if (!sitemap.includes(`${siteUrl}${path}`)) {
        fail(`Live sitemap is missing collection URL: ${path}`);
      }
    }

    if (html.includes('href="/files/') || html.includes(`${siteUrl}/files/`)) {
      fail(`Live ${check.path} still links to self-hosted PDF files.`);
    }
  }

  if (process.exitCode) process.exit();
  console.log("Live broad landing funnel audit passed.");
} catch (error) {
  fail(`Live broad landing funnel audit failed: ${error.message}`);
  process.exit();
}
