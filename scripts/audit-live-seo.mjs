const siteUrl = "https://sgexamhub.com";

const checks = [
  {
    path: "/",
    snippets: [
      "SG Exam Hub: Free Singapore Primary Exam Papers | 2026",
      "SG exam papers",
      "SG Exam Papers",
      "Latest available papers: 2025",
      "2,299 PDF exam papers indexed",
      "SiteNavigationElement",
      "Primary 6 Maths Exam Papers",
      "isAccessibleForFree",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      "SearchAction",
      "search_term_string",
      "Search papers",
      'property="og:site_name" content="SG Exam Hub"',
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
      'name="twitter:card" content="summary_large_image"',
      "G-7WKP91PV8C",
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics/",
    snippets: [
      "2025 P6 Maths Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "Latest available in this collection: 2025 · 12 PDF papers",
      "Start with recent papers",
      "Open one paper from this collection first",
      "Related exam paper collections",
      "Add a filter",
      'href="/exam-papers/2025-primary-6-mathematics-sa2"',
      "Broader searches",
      "Download PDF",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
      'name="twitter:card" content="summary_large_image"',
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics-sa2/",
    snippets: [
      "2025 P6 Maths SA2 Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "Start with recent papers",
      'href="/exam-papers/primary-6-mathematics-sa2"',
      "Download PDF",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/primary-6-mathematics-school-nanyang-primary-school/",
    snippets: [
      "P6 Maths Nanyang Primary School Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "Download PDF",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/view/6_1073_3_4_2025/",
    snippets: [
      'content="index, follow"',
      "LearningResource",
      "Free PDF Download",
      "Free PDF download for this 2025 P6 Maths SA2 exam paper",
      "isAccessibleForFree",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      "Opening exam paper",
      "Download PDF",
      "Next paper to try",
      "Revision checklist",
      "Download the PDF or open the next Primary 6 Maths paper",
      "FAQPage",
      "Using this paper",
      "Continue revision",
      "More Primary 6 Maths papers",
      "Is the 2025 Raffles Girls",
      "More from this school",
      "Same exam type",
      "Exam paper sitemap",
      'property="og:type" content="article"',
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/sitemap/",
    snippets: [
      "Singapore Primary Exam Paper Sitemap",
      "Top School Exam Paper Collections",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
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
      "user-agent": "SGExamHubLiveSeoAudit/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.text();
};

const representativePdfUrl =
  "https://raw.githubusercontent.com/airbob/PrimarySchoolExamPapers/main/public/files/6_1073_3_4_2025.pdf";

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

  const socialImage = await fetch(`${siteUrl}/og-image.png`, {
    headers: {
      "user-agent": "SGExamHubLiveSeoAudit/1.0",
    },
  });
  if (!socialImage.ok) {
    fail(`Live social preview image is unavailable: ${socialImage.status} ${socialImage.statusText}`);
  }

  const representativePdf = await fetch(representativePdfUrl, {
    method: "HEAD",
    headers: {
      "user-agent": "SGExamHubLiveSeoAudit/1.0",
    },
  });
  if (!representativePdf.ok) {
    fail(
      `Representative raw PDF is unavailable: ${representativePdf.status} ${representativePdf.statusText}`,
    );
  }
  const contentLength = Number(representativePdf.headers.get("content-length") || 0);
  if (contentLength < 1_000_000) {
    fail(`Representative raw PDF content length is unexpectedly small: ${contentLength}`);
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
    if (html.includes('href="/files/') || html.includes(`${siteUrl}/files/`)) {
      fail(`Live ${check.path} still links to self-hosted PDF files.`);
    }
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
