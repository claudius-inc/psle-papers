const siteUrl = "https://sgexamhub.com";
const topSchoolPath = "/top-school-exam-papers/";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveTopSchoolAudit/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
};

const expectedSchoolPaths = [
  "/exam-papers/school-methodist-girls-school-primary",
  "/exam-papers/school-singapore-chinese-girls-primary-school",
  "/exam-papers/school-chij-st-nicholas-girls-school",
  "/exam-papers/school-anglo-chinese-school-primary",
  "/exam-papers/school-anglo-chinese-school-junior",
  "/exam-papers/school-pei-hwa-presbyterian-primary-school",
  "/exam-papers/school-red-swastika-school",
  "/exam-papers/school-tao-nan-school",
];

try {
  const [topSchoolHtml, sitemap] = await Promise.all([
    fetchText(`${siteUrl}${topSchoolPath}`),
    fetchText(`${siteUrl}/sitemap.xml`),
  ]);

  for (const snippet of [
    "Top School Exam Papers Singapore",
    "Download free Singapore top school exam papers",
    "Choose a school collection",
    "No sign-up needed",
    "Anglo-Chinese School (Primary) exam papers",
    "Anglo-Chinese School (Junior) exam papers",
    "DownloadAction",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ]) {
    if (!topSchoolHtml.includes(snippet)) {
      fail(`Live top school page is missing expected snippet: ${snippet}`);
    }
  }

  for (const staleSnippet of [
    "Anglo Chinese School (Primary)",
    "Anglo Chinese School (Junior)",
  ]) {
    if (topSchoolHtml.includes(staleSnippet)) {
      fail(`Live top school page still contains stale school name: ${staleSnippet}`);
    }
  }

  for (const path of expectedSchoolPaths) {
    if (!topSchoolHtml.includes(`href="${path}"`)) {
      fail(`Live top school page is missing school link: ${path}`);
    }
    if (!sitemap.includes(`${siteUrl}${path}`)) {
      fail(`Live sitemap is missing school collection URL: ${path}`);
    }
  }

  if (topSchoolHtml.includes('href="/files/') || topSchoolHtml.includes(`${siteUrl}/files/`)) {
    fail("Live top school page still links to self-hosted PDF files.");
  }

  if (process.exitCode) process.exit();
  console.log("Live top school funnel audit passed.");
} catch (error) {
  fail(`Live top school funnel audit failed: ${error.message}`);
  process.exit();
}
