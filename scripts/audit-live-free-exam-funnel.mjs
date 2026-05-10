const siteUrl = "https://sgexamhub.com";
const freeExamPath = "/free-exam-papers/";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveFreeExamAudit/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
};

const expectedCollectionPaths = [
  "/exam-papers/2025",
  "/exam-papers/primary-6",
  "/exam-papers/mathematics",
  "/exam-papers/science",
  "/exam-papers/english",
  "/exam-papers/chinese",
  "/top-school-exam-papers",
  "/exam-papers/psle-revision",
];

try {
  const [freeExamHtml, sitemap] = await Promise.all([
    fetchText(`${siteUrl}${freeExamPath}`),
    fetchText(`${siteUrl}/sitemap.xml`),
  ]);

  for (const snippet of [
    "Free Exam Papers Singapore",
    "Download free Singapore primary exam papers",
    "Choose a free paper path",
    "Free exam paper collections",
    "No sign-up needed",
    "DownloadAction",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ]) {
    if (!freeExamHtml.includes(snippet)) {
      fail(`Live free exam page is missing expected snippet: ${snippet}`);
    }
  }

  for (const path of expectedCollectionPaths) {
    if (!freeExamHtml.includes(`href="${path}"`)) {
      fail(`Live free exam page is missing collection link: ${path}`);
    }
    if (!sitemap.includes(`${siteUrl}${path}`)) {
      fail(`Live sitemap is missing collection URL: ${path}`);
    }
  }

  if (freeExamHtml.includes('href="/files/') || freeExamHtml.includes(`${siteUrl}/files/`)) {
    fail("Live free exam page still links to self-hosted PDF files.");
  }

  if (process.exitCode) process.exit();
  console.log("Live free exam funnel audit passed.");
} catch (error) {
  fail(`Live free exam funnel audit failed: ${error.message}`);
  process.exit();
}
