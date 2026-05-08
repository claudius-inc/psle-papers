const siteUrl = "https://sgexamhub.com";

const checks = [
  {
    path: "/",
    snippets: [
      "Free Singapore Primary Exam Papers for 2026 Revision",
      "SiteNavigationElement",
      "Primary 6 Maths Exam Papers",
      "G-7WKP91PV8C",
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics/",
    snippets: [
      "2025 P6 Maths Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "Download PDF",
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics-sa2/",
    snippets: [
      "2025 P6 Maths SA2 Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "Download PDF",
    ],
  },
  {
    path: "/exam-papers/primary-6-mathematics-school-nanyang-primary-school/",
    snippets: [
      "P6 Maths Nanyang Primary School Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "Download PDF",
    ],
  },
  {
    path: "/view/6_1073_3_4_2025/",
    snippets: [
      'content="index, follow"',
      "LearningResource",
      "Download PDF",
      "Exam paper sitemap",
    ],
  },
  {
    path: "/sitemap/",
    snippets: ["Singapore Primary Exam Paper Sitemap", "Top School Exam Paper Collections"],
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SGExamHubLiveSeoAudit/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.text();
};

try {
  const [robots, sitemap] = await Promise.all([
    fetchText(`${siteUrl}/robots.txt`),
    fetchText(`${siteUrl}/sitemap.xml`),
  ]);

  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
    fail("Live robots.txt does not point to the canonical sitemap.");
  }

  const sitemapCount = (sitemap.match(/<url>/g) || []).length;
  if (sitemapCount < 3000) {
    fail(`Live sitemap has only ${sitemapCount} URLs; expected at least 3000.`);
  }

  for (const requiredPath of [
    "/",
    "/sitemap",
    "/exam-papers/2025-primary-6-mathematics",
    "/exam-papers/2025-primary-6-mathematics-sa2",
    "/exam-papers/primary-6-mathematics-sa2",
    "/exam-papers/primary-6-mathematics-school-nanyang-primary-school",
    "/exam-papers/primary-6-sa2",
    "/view/6_1073_3_4_2025",
  ]) {
    if (!sitemap.includes(`${siteUrl}${requiredPath}`)) {
      fail(`Live sitemap is missing ${requiredPath}.`);
    }
  }

  for (const check of checks) {
    const html = await fetchText(`${siteUrl}${check.path}`);
    for (const snippet of check.snippets) {
      if (!html.includes(snippet)) {
        fail(`Live ${check.path} is missing expected snippet: ${snippet}`);
      }
    }
  }

  console.log(`Live SEO audit checked ${checks.length} pages.`);
  console.log(`Live sitemap URLs: ${sitemapCount}.`);
  if (process.exitCode) process.exit();
  console.log("Live SEO audit passed.");
} catch (error) {
  fail(`Live SEO audit failed: ${error.message}`);
  process.exit();
}
