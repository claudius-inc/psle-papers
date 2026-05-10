import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const exactPaperCount = JSON.parse(readFileSync("public/json/files.json", "utf8")).length;
const exactPaperCountLabel = exactPaperCount.toLocaleString();

const staleHomepageSnippets = [
  "totalPaperCountRounded",
  "2,200+",
  "2,200 +",
  "2,300+",
];

const homepagePriorityDirectorySnippets = [
  "Primary 6 Chinese Exam Papers",
  "Primary 5 English Exam Papers",
  "Primary 5 Chinese Exam Papers",
  "Primary 4 Science Exam Papers",
  "Primary 4 English Exam Papers",
  "Primary 4 Chinese Exam Papers",
  "Primary 3 Maths Exam Papers",
  "Primary 3 Science Exam Papers",
  "Primary 3 English Exam Papers",
  "Primary 3 Chinese Exam Papers",
  "Primary 3 Higher Chinese Exam Papers",
  "Primary 6 English SA2 Exam Papers",
  "Primary 6 Chinese SA2 Exam Papers",
];

const broadLandingPages = [
  {
    sourcePath: "app/pages/free-exam-papers.vue",
    outputPath: ".output/public/free-exam-papers/index.html",
    title: "Free Exam Papers Singapore",
  },
  {
    sourcePath: "app/pages/past-year-exam-papers.vue",
    outputPath: ".output/public/past-year-exam-papers/index.html",
    title: "Past Year Exam Papers Singapore",
  },
  {
    sourcePath: "app/pages/test-papers.vue",
    outputPath: ".output/public/test-papers/index.html",
    title: "Singapore Primary Test Papers",
  },
  {
    sourcePath: "app/pages/top-school-exam-papers.vue",
    outputPath: ".output/public/top-school-exam-papers/index.html",
    title: "Top School Exam Papers Singapore",
  },
];

const revisionLandingPages = [
  {
    sourcePath: "app/pages/exam-papers/2026-revision.vue",
    outputPath: ".output/public/exam-papers/2026-revision/index.html",
    title: "2026 Primary Exam Papers Revision",
    sourceSnippets: [
      'class="featured-paper" aria-label="Featured latest paper" data-nosnippet',
      'class="paper-section" aria-labelledby="latest-papers-heading" data-nosnippet',
      'class="paper-section" aria-labelledby="p6-sa2-heading" data-nosnippet',
    ],
    patterns: [
      /class="featured-paper"[^>]*data-nosnippet/s,
      /class="paper-section"[^>]*aria-labelledby="latest-papers-heading"[^>]*data-nosnippet/s,
      /class="paper-section"[^>]*aria-labelledby="p6-sa2-heading"[^>]*data-nosnippet/s,
    ],
  },
  {
    sourcePath: "app/pages/exam-papers/psle-revision.vue",
    outputPath: ".output/public/exam-papers/psle-revision/index.html",
    title: "PSLE Revision Papers",
    sourceSnippets: [
      'class="feature-card" aria-label="Featured PSLE paper" data-nosnippet',
      'class="section" aria-labelledby="latest-psle-heading" data-nosnippet',
      'class="section" aria-labelledby="p6-sa2-heading" data-nosnippet',
    ],
    patterns: [
      /class="feature-card"[^>]*data-nosnippet/s,
      /class="section"[^>]*aria-labelledby="latest-psle-heading"[^>]*data-nosnippet/s,
      /class="section"[^>]*aria-labelledby="p6-sa2-heading"[^>]*data-nosnippet/s,
    ],
  },
];

const checks = [
  {
    path: "app/pages/index.vue",
    snippets: [
      'class="filters-bar" data-nosnippet',
      'class="hero-paper-cta" data-nosnippet',
      'class="hero-stats" data-nosnippet',
      ':class="[\'papers-container\', `papers-${viewMode}`]" data-nosnippet',
      'class="content-wrapper seo-links" aria-labelledby="latest-papers" data-nosnippet',
      exactPaperCountLabel,
      ...homepagePriorityDirectorySnippets,
    ],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: "public/og-image.svg",
    snippets: [
      `${exactPaperCountLabel} PDF papers`,
      "Free download",
    ],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: "app/pages/exam-papers/[[slug]].vue",
    snippets: [
      'class="filter-container" data-nosnippet',
      'class="collection-action-strip" data-nosnippet',
      'class="mobile-collection-action-bar" data-nosnippet',
      ':class="[\'papers-container\', `papers-${viewMode}`]" data-nosnippet',
    ],
    patterns: [/class="starter-section"[^>]*data-nosnippet/s],
  },
  {
    path: ".output/public/index.html",
    snippets: [
      "data-nosnippet",
      "hero-paper-cta",
      "SG Exam Hub: Free Singapore Primary Exam Papers",
      "No sign-up needed",
      `${exactPaperCountLabel} PDF exam papers indexed`,
      ...homepagePriorityDirectorySnippets,
    ],
    patterns: [/class="hero-paper-cta"[^>]*data-nosnippet/s],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: ".output/public/exam-papers/index.html",
    snippets: [
      "data-nosnippet",
      "collection-action-strip",
      "starter-section",
      "mobile-collection-action-bar",
      "Singapore Primary Exam Papers PDF | Free Download",
      "No sign-up needed",
    ],
    patterns: [
      /class="collection-action-strip"[^>]*data-nosnippet/s,
      /class="starter-section"[^>]*data-nosnippet/s,
      /class="mobile-collection-action-bar"[^>]*data-nosnippet/s,
    ],
  },
  {
    path: ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    snippets: [
      "data-nosnippet",
      "collection-action-strip",
      "starter-section",
      "mobile-collection-action-bar",
      "2025 Primary 6 Maths SA2 Exam Papers",
      "Download PDF",
    ],
    patterns: [
      /class="collection-action-strip"[^>]*data-nosnippet/s,
      /class="starter-section"[^>]*data-nosnippet/s,
      /class="mobile-collection-action-bar"[^>]*data-nosnippet/s,
    ],
  },
  ...broadLandingPages.flatMap((page) => [
    {
      path: page.sourcePath,
      snippets: [
        'class="hero-card" data-nosnippet',
        'class="content-wrapper paper-section" aria-labelledby="latest-heading" data-nosnippet',
      ],
    },
    {
      path: page.outputPath,
      snippets: [
        "data-nosnippet",
        "hero-card",
        "paper-section",
        page.title,
        "Download PDF",
      ],
      patterns: [
        /class="hero-card"[^>]*data-nosnippet/s,
        /class="content-wrapper paper-section"[^>]*data-nosnippet/s,
      ],
    },
  ]),
  ...revisionLandingPages.flatMap((page) => [
    {
      path: page.sourcePath,
      snippets: page.sourceSnippets,
    },
    {
      path: page.outputPath,
      snippets: [
        "data-nosnippet",
        page.title,
        "Download PDF",
      ],
      patterns: page.patterns,
    },
  ]),
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const normalizeForSnippetChecks = (content) =>
  content
    .replace(/&nbsp;/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "");

const assertNoForbiddenSnippets = (content, forbiddenSnippets, label) => {
  const compactContent = normalizeForSnippetChecks(content);
  for (const snippet of forbiddenSnippets || []) {
    const compactSnippet = normalizeForSnippetChecks(snippet);
    if (content.includes(snippet) || compactContent.includes(compactSnippet)) {
      fail(`${label} contains stale snippet-focused UI copy: ${snippet}`);
    }
  }
};

const walkFiles = (directory) => {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walkFiles(path) : [path];
  });
};

for (const check of checks) {
  if (!existsSync(check.path)) {
    fail(`Missing snippet-focused UI audit target: ${check.path}`);
    continue;
  }

  const content = readFileSync(check.path, "utf8");

  for (const snippet of check.snippets) {
    if (!content.includes(snippet)) {
      fail(`${check.path} is missing snippet-focused UI snippet: ${snippet}`);
    }
  }
  for (const pattern of check.patterns || []) {
    if (!pattern.test(content)) {
      fail(`${check.path} is missing snippet-focused UI pattern: ${pattern}`);
    }
  }
  assertNoForbiddenSnippets(content, check.forbiddenSnippets, check.path);
}

for (const assetPath of walkFiles(".output/public/_nuxt").filter((path) =>
  /\.(?:js|mjs|json|html)$/.test(path),
)) {
  assertNoForbiddenSnippets(
    readFileSync(assetPath, "utf8"),
    staleHomepageSnippets,
    assetPath,
  );
}

if (process.exitCode) process.exit();
console.log("Snippet-focused UI audit passed.");
