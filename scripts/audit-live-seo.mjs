const siteUrl = "https://sgexamhub.com";

const checks = [
  {
    path: "/",
    snippets: [
      "SG Exam Hub: Free Singapore Primary Exam Papers | 2026",
      "SG exam papers",
      "SG Exam Papers",
      "No sign-up needed",
      "Latest available papers: 2025",
      "2,299 PDF exam papers indexed",
      "Start with a latest paper",
      "2025 P6 English SA2",
      "2026 Primary Exam Papers Revision",
      'href="/exam-papers/2026-revision"',
      "Free Exam Papers Singapore",
      'href="/free-exam-papers"',
      "Past Year Exam Papers Singapore",
      'href="/past-year-exam-papers"',
      "Singapore Primary Test Papers",
      'href="/test-papers"',
      "Top School Exam Papers Singapore",
      'href="/top-school-exam-papers"',
      "PSLE Revision Papers",
      'href="/exam-papers/psle-revision"',
      "PSLE revision paths",
      "Start with Primary 6 SA2 exam papers",
      "2025 Primary 6 SA2 Exam Papers",
      "2025 Nanyang Primary School SA2 Exam Papers",
      'href="/exam-papers/2025-sa2-school-nanyang-primary-school"',
      "2025 Raffles Girls&#39; Primary School SA2 Exam Papers",
      'href="/exam-papers/2025-sa2-school-raffles-girls-primary-school"',
      'href="/exam-papers/primary-6-science-sa2"',
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
    path: "/free-exam-papers/",
    snippets: [
      "Free Exam Papers Singapore",
      "Download free Singapore primary exam papers",
      "No sign-up needed",
      "Start with a free paper",
      "Free exam paper collections",
      "Latest free exam papers",
      "Are these Singapore exam papers free to download?",
      "FAQPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/past-year-exam-papers/",
    snippets: [
      "Past Year Exam Papers Singapore",
      "Download Singapore primary past year exam papers",
      "No sign-up needed",
      "Start with a recent past year paper",
      "Past year exam paper collections",
      "Recent past year exam papers",
      "Are these past year exam papers free?",
      "FAQPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/test-papers/",
    snippets: [
      "Free Test Papers Singapore",
      "Singapore Primary Test Papers",
      "Download free Singapore primary test papers",
      "No sign-up needed",
      "Start with a recent test paper",
      "Choose a test paper path",
      "Latest primary test papers",
      "Are these Singapore primary test papers free?",
      "FAQPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/top-school-exam-papers/",
    snippets: [
      "Top School Exam Papers Singapore",
      "Download free Singapore top school exam papers",
      "No sign-up needed",
      "Start with a recent top school paper",
      "Choose a school collection",
      "Latest top school exam papers",
      "Are these top school exam papers free to download?",
      "Raffles Girls&#39; Primary School exam papers",
      "Nanyang Primary School exam papers",
      "FAQPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/exam-papers/",
    snippets: [
      "Singapore Primary Exam Papers PDF | Free Download",
      "Download 2,299 free Singapore primary exam papers PDF files",
      "Latest available in this collection: 2025 · 2,299 PDF papers",
      "Open the newest paper, then download PDFs for timed revision.",
      "Download PDF",
      "CollectionPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/exam-papers/psle-revision/",
    snippets: [
      "PSLE Practice Papers | Primary 6 Revision PDFs",
      "PSLE Revision Papers",
      "No sign-up needed",
      "Choose a Primary 6 practice set",
      'href="/exam-papers/2025-primary-6-sa2"',
      "Recent Primary 6 papers for PSLE revision",
      "Primary 6 SA2 papers for PSLE timing",
      "Are these papers useful for PSLE revision?",
      "FAQPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/exam-papers/2026-revision/",
    snippets: [
      "2026 Primary Exam Papers Revision",
      "No sign-up needed",
      "Choose a 2026 revision collection",
      'href="/exam-papers/2025-primary-6-sa2"',
      "Latest papers for 2026 revision",
      "Primary 6 SA2 papers for 2026 preparation",
      "Are there 2026 Singapore primary exam papers here?",
      "FAQPage",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
    ],
  },
  {
    path: "/exam-papers/2025/",
    snippets: [
      "2025 Exam Papers",
      "Latest available for 2026 revision. View online or download free PDFs.",
      "Year paper paths",
      "Start with 2025 primary exam papers",
      'href="/exam-papers/2025-primary-6"',
      'href="/exam-papers/2025-primary-6-mathematics"',
      "Download PDF",
    ],
  },
  {
    path: "/exam-papers/2025-primary-6-mathematics/",
    snippets: [
      "2025 Primary 6 Maths Exam Papers",
      "View online or download free PDFs for PSLE revision.",
      'rel="canonical"',
      "CollectionPage",
      "Latest available in this collection: 2025 · 12 PDF papers",
      "Best first step",
      "Open the newest paper, then download PDFs for timed revision.",
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
      "2025 Primary 6 Maths SA2 Exam Papers",
      "View online or download free PDFs for PSLE revision.",
      'rel="canonical"',
      "CollectionPage",
      "Start with recent papers",
      "PSLE practice focus",
      "Use these Primary 6 papers before PSLE revision",
      "Are these 2025 Primary 6 Maths SA2 Exam Papers useful for PSLE revision?",
      'href="/exam-papers/primary-6-mathematics-sa2"',
      "Download PDF",
      'property="og:image" content="https://sgexamhub.com/og-image.png"',
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/primary-6-mathematics/",
    snippets: [
      "Primary 6 Maths Exam Papers",
      "Subject revision path",
      "Continue P6 Maths revision",
      'href="/exam-papers/2025-primary-6-mathematics"',
      'href="/exam-papers/primary-6-science"',
      "Download PDF",
    ],
  },
  {
    path: "/exam-papers/primary-6-mathematics-sa2/",
    snippets: [
      "Primary 6 Maths SA2 Exam Papers",
      "View online or download free PDFs for PSLE revision.",
      "Assessment practice path",
      "Compare P6 Maths assessment papers",
      'href="/exam-papers/primary-6-mathematics-wa2"',
      "Download PDF",
    ],
  },
  {
    path: "/exam-papers/sa2/",
    snippets: [
      "SA2 Exam Papers",
      "View online or download free PDFs for Singapore primary timed practice.",
      "Showing <strong",
      "Show more papers",
      "Download PDF",
      "HowTo",
      "HowToStep",
    ],
  },
  {
    path: "/exam-papers/primary-6-mathematics-school-nanyang-primary-school/",
    snippets: [
      "Primary 6 Maths Nanyang Primary School Exam Papers",
      "Compare school papers online, then download free PDFs for revision.",
      'rel="canonical"',
      "CollectionPage",
      "School paper paths",
      "More Nanyang Primary School exam papers",
      'href="/exam-papers/primary-6-science-school-nanyang-primary-school"',
      "Download PDF",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/primary-6-school-nanyang-primary-school/",
    snippets: [
      "Primary 6 Nanyang Primary School Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "School paper paths",
      'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
      "Download PDF",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/mathematics-school-nanyang-primary-school/",
    snippets: [
      "Maths Nanyang Primary School Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "School paper paths",
      'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
      "Download PDF",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/sa2-school-nanyang-primary-school/",
    snippets: [
      "SA2 Nanyang Primary School Exam Papers",
      "Compare school papers online, then download free PDFs for revision.",
      'rel="canonical"',
      "CollectionPage",
      "School paper paths",
      'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
      "Download PDF",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
    ],
  },
  {
    path: "/exam-papers/2025-sa2-school-nanyang-primary-school/",
    snippets: [
      "2025 SA2 Nanyang Primary School Exam Papers",
      'rel="canonical"',
      "CollectionPage",
      "HowTo",
      "HowToStep",
      "School paper paths",
      'href="/exam-papers/primary-6-mathematics-school-nanyang-primary-school"',
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
      "Free 2025 Raffles Girls' Primary School P6 Maths SA2 exam paper PDF",
      "isAccessibleForFree",
      "DownloadAction",
      "raw.githubusercontent.com/airbob/PrimarySchoolExamPapers",
      "Opening exam paper",
      "Download PDF",
      "Next paper to try",
      "Revision checklist",
      "Practice sequence",
      "Open one related paper after marking this PDF",
      "Download the PDF or open the next Primary 6 Maths paper",
      "FAQPage",
      "HowTo",
      "HowToStep",
      "Using this paper",
      "Continue revision",
      "More Primary 6 Maths papers",
      "Same school and assessment",
      'href="/exam-papers/2025-sa2-school-raffles-girls-primary-school"',
      "2025 SA2 Raffles Girls",
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
      "Quick Revision Paths",
      "Current Revision Hubs",
      "Past Year Exam Papers Singapore",
      'href="/past-year-exam-papers"',
      "Singapore Primary Test Papers",
      'href="/test-papers"',
      "Top School Exam Papers Singapore",
      'href="/top-school-exam-papers"',
      "2026 Primary Exam Papers Revision",
      'href="/exam-papers/2026-revision"',
      "PSLE Revision Papers",
      'href="/exam-papers/psle-revision"',
      "2025 Primary 6 Maths SA2 Exam Papers",
      "Primary 6 Maths Nanyang Primary School Exam Papers",
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
    "/free-exam-papers",
    "/test-papers",
    "/top-school-exam-papers",
    "/exam-papers/2026-revision",
    "/exam-papers/psle-revision",
    "/exam-papers/2025-primary-6-mathematics",
    "/exam-papers/2025-primary-6-mathematics-sa2",
    "/exam-papers/primary-6-mathematics-sa2",
    "/exam-papers/primary-6-mathematics-school-nanyang-primary-school",
    "/exam-papers/primary-6-school-nanyang-primary-school",
    "/exam-papers/mathematics-school-nanyang-primary-school",
    "/exam-papers/sa2-school-nanyang-primary-school",
    "/exam-papers/2025-sa2-school-nanyang-primary-school",
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
