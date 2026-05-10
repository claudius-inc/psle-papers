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

const expectedSchoolLinks = [
  ["Methodist Girls' School", "/exam-papers/school-methodist-girls-school-primary"],
  ["Singapore Chinese Girls' Primary School", "/exam-papers/school-singapore-chinese-girls-primary-school"],
  ["CHIJ St. Nicholas Girls' School", "/exam-papers/school-chij-st-nicholas-girls-school"],
  ["Anglo Chinese School (Primary)", "/exam-papers/school-anglo-chinese-school-primary"],
  ["Anglo Chinese School (Junior)", "/exam-papers/school-anglo-chinese-school-junior"],
  ["Pei Hwa Presbyterian Primary School", "/exam-papers/school-pei-hwa-presbyterian-primary-school"],
  ["Red Swastika School", "/exam-papers/school-red-swastika-school"],
  ["Tao Nan School", "/exam-papers/school-tao-nan-school"],
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
    "DownloadAction",
    "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
  ]) {
    if (!topSchoolHtml.includes(snippet)) {
      fail(`Live top school page is missing expected snippet: ${snippet}`);
    }
  }

  for (const [schoolName, path] of expectedSchoolLinks) {
    if (!topSchoolHtml.includes(schoolName)) {
      fail(`Live top school page is missing school name: ${schoolName}`);
    }
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
