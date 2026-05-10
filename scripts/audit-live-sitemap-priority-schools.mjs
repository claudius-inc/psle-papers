const siteUrl = "https://sgexamhub.com";

const prioritySchoolPaths = [
  "/exam-papers/school-raffles-girls-primary-school",
  "/exam-papers/school-nanyang-primary-school",
  "/exam-papers/school-henry-park-primary-school",
  "/exam-papers/school-methodist-girls-school-primary",
  "/exam-papers/school-singapore-chinese-girls-primary-school",
  "/exam-papers/school-chij-st-nicholas-girls-school",
  "/exam-papers/school-anglo-chinese-school-primary",
  "/exam-papers/school-anglo-chinese-school-junior",
  "/exam-papers/school-pei-hwa-presbyterian-primary-school",
  "/exam-papers/school-red-swastika-school",
  "/exam-papers/school-tao-nan-school",
];

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveSitemapPriorityAudit/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.text();
}

function assertIncludes(content, snippets, label) {
  const missing = snippets.filter((snippet) => !content.includes(snippet));

  if (missing.length > 0) {
    throw new Error(`${label} missing expected snippets:\n- ${missing.join("\n- ")}`);
  }
}

const sitemapHtml = await fetchText(`${siteUrl}/sitemap/`);

assertIncludes(
  sitemapHtml,
  [
    "Priority school collections",
    "Top School Exam Paper Paths",
    "MGS",
    "SCGS",
    "CHIJ St. Nicholas",
    "Red Swastika",
    "Tao Nan",
  ],
  "Live sitemap priority school section",
);

assertIncludes(
  sitemapHtml,
  prioritySchoolPaths,
  "Live sitemap priority school links",
);

const xmlSitemap = await fetchText(`${siteUrl}/sitemap.xml`);

assertIncludes(
  xmlSitemap,
  prioritySchoolPaths.map((path) => `${siteUrl}${path}`),
  "Live XML sitemap priority school URLs",
);

console.log("Live sitemap priority school audit passed.");
