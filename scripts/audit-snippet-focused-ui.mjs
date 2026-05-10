import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const staleHomepageSnippets = [
  "totalPaperCountRounded",
  "2,200+",
  "2,200 +",
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

const checks = [
  {
    path: "app/pages/index.vue",
    snippets: [
      'class="filters-bar" data-nosnippet',
      'class="hero-stats" data-nosnippet',
      ':class="[\'papers-container\', `papers-${viewMode}`]" data-nosnippet',
      ...homepagePriorityDirectorySnippets,
    ],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: "app/pages/exam-papers/[[slug]].vue",
    snippets: [
      'class="filter-container" data-nosnippet',
      ':class="[\'papers-container\', `papers-${viewMode}`]" data-nosnippet',
    ],
  },
  {
    path: ".output/public/index.html",
    snippets: [
      "data-nosnippet",
      "SG Exam Hub: Free Singapore Primary Exam Papers",
      "No sign-up needed",
      "2,299 PDF exam papers indexed",
      ...homepagePriorityDirectorySnippets,
    ],
    forbiddenSnippets: staleHomepageSnippets,
  },
  {
    path: ".output/public/exam-papers/index.html",
    snippets: [
      "data-nosnippet",
      "Singapore Primary Exam Papers PDF | Free Download",
      "No sign-up needed",
    ],
  },
  {
    path: ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    snippets: [
      "data-nosnippet",
      "2025 Primary 6 Maths SA2 Exam Papers",
      "Download PDF",
    ],
  },
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
